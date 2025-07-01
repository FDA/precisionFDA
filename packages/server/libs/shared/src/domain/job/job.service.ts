import { EntityManager } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailSendInput } from '@shared/domain/email/email.config'
import { EmailService } from '@shared/domain/email/email.service'
import { buildEmailTemplate } from '@shared/domain/email/email.helper'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import {
  reportStaleJobsTemplate,
  ReportStaleJobsTemplateInput,
} from '@shared/domain/email/templates/mjml/report-stale-jobs.template'
import { Job } from '@shared/domain/job/job.entity'
import { buildIsOverMaxDuration } from '@shared/domain/job/job.helper'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { createSyncJobStatusTask, getMainQueue } from '@shared/queue'
import { difference } from 'ramda'
import { NOTIFICATION_ACTION, SEVERITY } from '../../enums'
import * as errors from '../../errors'
import { PlatformClient } from '../../platform-client'
import {
  DnanexusLink,
  FileStateResult,
  FindJobsResponse,
  JobOutput,
} from '../../platform-client/platform-client.responses'
import { Maybe, UserCtx } from '../../types'
import { DxId } from '../entity/domain/dxid'
import { createFileEvent, EVENT_TYPES } from '../event/event.helper'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../space-event/space-event.enum'
import { FolderService } from '../user-file/folder.service'
import { FILE_STATE_DX, PARENT_TYPE } from '../user-file/user-file.types'
import { UserRepository } from '../user/user.repository'
import { JobRepository } from './job.repository'
import { CheckStatusJob, TASK_TYPE } from '@shared/queue/task.input'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { Job as BullJob } from 'bull'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { JOB_STATE } from '@shared/domain/job/job.enum'

@Injectable()
export class JobService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: EntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly folderService: FolderService,
    private readonly emailsJobProducer: EmailQueueJobProducer,
    private readonly jobSyncService: JobSynchronizationService,
    private readonly emailService: EmailService,
    private readonly userRepo: UserRepository,
    private readonly jobRepo: JobRepository,
    private readonly spaceRepo: SpaceRepository,
    private readonly spaceMembershipRepo: SpaceMembershipRepository,
  ) {}

  async synchronizeJob(checkStatusJob: CheckStatusJob['payload']): Promise<Maybe<Job>> {
    return await this.jobSyncService.synchronizeJob(checkStatusJob)
  }

  async checkChallengeJobs(): Promise<void> {
    this.logger.log(`checkChallengeJobs`)
    const challengeBotUser = await this.userRepo.findOneOrFail({
      dxuser: config.platform.challengeBotUser,
    })
    const jobs = await this.getNonTerminalJobs(challengeBotUser.id)
    if (jobs.length > 0) {
      this.logger.log('Found non-terminal users for challenge bot user, syncing outputs')
      for (const job of jobs) {
        // TODO just temporary before we move to DI
        // DI needs to take into account that the operation is run
        // under challenge bot user
        const user = {
          id: challengeBotUser.id,
          dxuser: challengeBotUser.dxuser,
          accessToken: config.platform.challengeBotAccessToken,
        }
        const data: CheckStatusJob = {
          user,
          type: TASK_TYPE.SYNC_JOB_STATUS,
          payload: {
            dxid: job.dxid,
          },
        }
        await this.jobSyncService.synchronizeJob(data.payload)
      }
    } else {
      this.logger.log('No non-terminal jobs found for challenge bot user')
    }
  }

  async findAccessible(dxid: DxId<'job'>): Promise<Job> {
    const job = await this.jobRepo.findAccessibleOne({ dxid })
    if (!job) {
      throw new errors.NotFoundError(`Job ${dxid} was not found or is not accessible`)
    }
    return job
  }

  /**
   * Asynchronously checks for stale jobs and performs necessary actions.
   *
   * The method performs the following steps:
   * 1. Retrieves all running jobs that are close to their "deadline" (30 days in production).
   * 2. Checks if there are any missing SyncJobOperations for the retrieved jobs and recreates them if necessary.
   * 3. Logs and returns an empty array if no running jobs are found.
   * 4. Filters out the stale jobs based on a maximum duration threshold and logs the result.
   * 5. Calculates the non-stale jobs by finding the difference between running jobs and stale jobs.
   * 6. Logs information about both stale and non-stale jobs for administrative purposes.
   * 7. Generates and sends an email report to the admin user and a predefined email address, containing details of stale and non-stale jobs.
   *
   * @returns {Promise<Job[]>} A promise that resolves to an array of stale jobs.
   */
  async checkStaleJobs(): Promise<Job[]> {
    // TODO cut into smaller methods
    // find running jobs that are close to "deadline" -> 30days in production
    const runningJobs = await this.jobRepo.find(
      {},
      {
        filters: ['isNonTerminal'],
        orderBy: { createdAt: 'DESC' },
        populate: ['app', 'user'],
      },
    )

    runningJobs.map(async (job) => {
      const runningJob = await getMainQueue().getJob(
        JobSynchronizationService.getBullJobId(job.dxid),
      )
      if (!runningJob) {
        await createSyncJobStatusTask(job, this.user)
        this.logger.log({}, `Recreated missing SyncJobOperation for ${job.dxid}`)
      }
    })
    if (runningJobs.length === 0) {
      this.logger.log({}, 'No running jobs found')
      return []
    }

    const isOverMaxDuration = buildIsOverMaxDuration('notify')
    const staleJobs: Job[] = runningJobs.filter((job) => isOverMaxDuration(job))
    if (staleJobs.length === 0) {
      this.logger.log({}, 'No stale jobs found')
    }

    // TODO(samuel) use Set instead - reduce bundle size
    // TODO(samuel) refactor into repository method instead
    const nonStaleJobs = difference(runningJobs, staleJobs)

    const createJobInfo = (
      job: Job,
    ): {
      duration: string
      uid: `job-${string}-${number}`
      name: string
      dxuser: string
      state: JOB_STATE
    } => ({
      uid: job.uid,
      name: job.name,
      state: job.state,
      dxuser: job.user.getEntity().dxuser,
      duration: job.elapsedTimeSinceCreationString(),
    })
    const nonStaleJobsInfo = nonStaleJobs.map(createJobInfo)
    const staleJobsInfo = staleJobs.map(createJobInfo)

    this.logger.log(
      { nonStaleJobsInfo: nonStaleJobsInfo },
      'Non stale jobs - for admin to note the times',
    )
    this.logger.log({ staleJobs: staleJobsInfo }, 'Stale jobs - should be terminated')

    // generate email for admin with list of jobs
    const adminUser = await this.userRepo.findAdminUser()
    const body = buildEmailTemplate<ReportStaleJobsTemplateInput>(reportStaleJobsTemplate, {
      receiver: adminUser,
      content: {
        staleJobsInfo: staleJobsInfo,
        nonStaleJobsInfo: nonStaleJobsInfo,
        maxDuration: config.workerJobs.syncJob.staleJobsEmailAfter.toString() ?? '-1',
      },
    })
    const email: EmailSendInput = {
      emailType: EMAIL_TYPES.staleJobsReport,
      to: adminUser.email,
      body,
      subject: 'Stale jobs report',
    }
    const emailToPfda: EmailSendInput = {
      emailType: EMAIL_TYPES.staleJobsReport,
      to: 'precisionfda-no-reply@dnanexus.com',
      body,
      subject: 'Stale jobs report',
    }

    await this.emailsJobProducer.createSendEmailTask(email, { dxuser: adminUser.dxuser } as UserCtx)
    await this.emailsJobProducer.createSendEmailTask(emailToPfda, {
      dxuser: adminUser.dxuser,
    } as UserCtx)

    return staleJobs
  }

  /**
   * Gets non-terminal jobs for the challenge user.
   */
  private async getNonTerminalJobs(userId: number): Promise<Job[]> {
    const user = this.userRepo.getReference(userId)
    return await this.jobRepo.find({ user }, { filters: ['isNonTerminal'] })
  }

  /**
   * Synchronizes outputs for a job. This method has to be run after job completes.
   * It stores data about job outputs in the database, creates files and file events.
   *
   * previously the code was in job_syncing.rb
   *
   * @param jobDxId
   */
  async syncOutputs(jobDxId: DxId<'job'>): Promise<void> {
    this.logger.log(`Syncing output files for job ${jobDxId}`)

    const user = await this.user.loadEntity()
    const job = await this.jobRepo.findOneOrFail({ dxid: jobDxId })
    const result = await this.getJobResult(job)

    await this.em.begin()
    try {
      const output = result.results[0].describe.output
      const uniqueFileDxIds = this.collectIds(output)
      const remappedOutput = this.remapFiles(output)

      const projectDxId = job.project ? job.project : user.privateFilesProject
      const outputFiles = await this.getOutputFiles(uniqueFileDxIds, projectDxId!, user, job)

      await this.persistFiles(outputFiles, user)

      this.updateJobRunData(job, remappedOutput)

      if (job.isInSpace()) {
        // TODO temporarily before we move to Service model
        const spaceService = new SpaceEventService(
          this.user,
          this.em as SqlEntityManager,
          this.spaceRepo,
          this.userRepo,
          this.spaceMembershipRepo,
          this.emailService,
        )
        const spaceEvent = await spaceService.createSpaceEvent({
          entity: { type: 'job', value: job },
          spaceId: job.getSpaceId(),
          userId: this.user.id,
          activityType: SPACE_EVENT_ACTIVITY_TYPE.job_completed,
        })
        await spaceService.sendNotificationForEvent(spaceEvent)
      }

      await this.createNotification(jobDxId, this.user.id, this.user.sessionId)
      await this.em.commit()
      this.logger.log(`Outputs for job ${jobDxId} have been synchronized`)
    } catch (error) {
      this.logger.error('Error synchronizing outputs', error)
      await this.em.rollback()
      throw error
    }
  }

  private async getOrCreateOutputFolder(job: Job): Promise<Folder | null> {
    if (job.runData.output_folder_path) {
      const folders = await this.folderService.createFoldersOnPath(
        job.runData.output_folder_path,
        job.scope,
        job.user.id,
        { type: 'job', value: job },
      )
      return folders[folders.length - 1]
    }
    return null
  }

  private updateJobRunData(job: Job, output: JobOutput): void {
    job.runData.run_outputs = output
    // describe is updated by job's synchronize.ts
    this.em.persist(job)
  }

  private async getOutputFiles(
    fileDxids: string[],
    projectDxid: string,
    user: User,
    job: Job,
  ): Promise<UserFile[]> {
    const outputFiles: UserFile[] = []
    if (fileDxids.length > 0) {
      const fileStateResults = await this.platformClient.fileStates({
        fileDxids,
        projectDxid,
      })

      const parentFolder = await this.getOrCreateOutputFolder(job)

      for (const fileStateResult of fileStateResults) {
        const file = this.createFile(user, projectDxid, fileStateResult, job, parentFolder)
        outputFiles.push(file)
      }
    }
    return outputFiles
  }

  private async createNotification(
    jobDxId: string,
    userId: number,
    sessionId: string,
  ): Promise<void> {
    await this.notificationService.createNotification({
      message: `Outputs for job ${jobDxId} have been synchronized`,
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
      userId,
      sessionId,
    })
  }

  private async persistFiles(outputFiles: UserFile[], user: User): Promise<void> {
    const filePromises = outputFiles.map(async (outputFile) => {
      await this.em.persistAndFlush(outputFile) // flush for id

      const fileEvent = await createFileEvent(
        EVENT_TYPES.FILE_CREATED,
        outputFile,
        outputFile.name, // path
        user,
        PARENT_TYPE.JOB,
      )

      return this.em.persistAndFlush(fileEvent)
    })

    await Promise.all(filePromises)
  }

  private async getJobResult(job: Job): Promise<FindJobsResponse> {
    const result = await this.platformClient.jobFind({
      id: [job.dxid],
      describe: true,
    })
    if (result.results.length !== 1) {
      throw new errors.InvalidStateError(`Incorrect number of results for job ${job.dxid}`)
    }
    return result
  }

  private createFile(
    user: User,
    projectDxId: string,
    fileStateResult: FileStateResult,
    job: Job,
    parentFolder: Folder | null,
  ): UserFile {
    if (!fileStateResult.describe) {
      throw new errors.InvalidStateError(
        `Platform didn't give describe for file id ${fileStateResult.id}`,
      )
    }
    const file = new UserFile(user)
    file.dxid = fileStateResult.id
    file.uid = `${fileStateResult.id}-1`
    file.project = projectDxId!
    file.name = fileStateResult.describe.name
    file.state = FILE_STATE_DX.CLOSED
    file.fileSize = fileStateResult.describe.size
    file.parentId = job.id
    file.parentType = PARENT_TYPE.JOB
    file.scope = parentFolder ? parentFolder.scope : job.scope

    if (parentFolder) {
      if (file.isInSpace()) {
        file.scopedParentFolderId = parentFolder.id
      } else {
        file.parentFolderId = parentFolder.id
      }
    } else if (job.localFolderId) {
      if (file.isInSpace()) {
        file.scopedParentFolderId = job.localFolderId
      } else {
        file.parentFolderId = job.localFolderId
      }
    }
    return file
  }

  private isDnaNexusLink(val: unknown): val is DnanexusLink {
    return val instanceof Object && '$dnanexus_link' in val
  }

  /**
   * Transforms files link that look like:
   * "file_output": {
   *   "$dnanexus_link": "file-GY6b6QQ0x97GQ4PGb4vB60jZ"
   * },
   * "file_array_output": [
   *   {
   *     "$dnanexus_link": "file-GY6b6Qj0x979Vpz3vp2yxK0g"
   *   }
   * ]
   *
   * into following:
   * "file_output": "file-GY6b6QQ0x97GQ4PGb4vB60jZ",
   * "file_array_output": [
   *   "file-GY6b6Qj0x979Vpz3vp2yxK0g"
   * ]
   *
   * @param outputParam
   * @private
   */
  private remapFiles(outputParam: JobOutput): JobOutput {
    const output = JSON.parse(JSON.stringify(outputParam))
    for (const key in output) {
      if (output.hasOwnProperty(key)) {
        const value = output[key]
        if (Array.isArray(value)) {
          this.remapArrayOfFiles(value, output, key)
        } else if (this.isDnaNexusLink(value)) {
          output[key] = value.$dnanexus_link
        }
      }
    }
    return output
  }

  private remapArrayOfFiles(value: DnanexusLink[], output: JobOutput, key: string): void {
    const linkArray: string[] = []
    value.forEach((item) => {
      if (this.isDnaNexusLink(item)) {
        linkArray.push(item.$dnanexus_link)
      }
    })
    if (linkArray.length > 0) {
      output[key] = linkArray
    }
  }

  /**
   * Collects unique DNA Nexus file IDs from the given job output.
   *
   * This method iterates over the properties of the provided job output and extracts unique DNA Nexus file IDs.
   * The extracted IDs are gathered into a set to ensure uniqueness and then converted to an array for the final result.
   *
   * @param {JobOutput} output - The job output containing potential DNA Nexus links.
   * @returns {string[]} An array of unique DNA Nexus file IDs.
   */
  private collectIds(output: JobOutput): string[] {
    const uniqueFileDxIds = new Set<string>()
    for (const key in output) {
      if (output.hasOwnProperty(key)) {
        const value = output[key]
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (this.isDnaNexusLink(item)) {
              uniqueFileDxIds.add(item.$dnanexus_link)
            }
          })
        } else if (this.isDnaNexusLink(value)) {
          uniqueFileDxIds.add(value.$dnanexus_link)
        }
      }
    }
    return Array.from(uniqueFileDxIds)
  }
}
