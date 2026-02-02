import { EntityManager } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { EmailService } from '@shared/domain/email/email.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SearchableByUid } from '@shared/domain/entity/interface/searchable-by-uid.interface'
import { EVENT_TYPES } from '@shared/domain/event/event.entity'
import { Job } from '@shared/domain/job/job.entity'
import { JobSynchronizationService } from '@shared/domain/job/services/job-synchronization.service'
import { JobCountService } from '@shared/domain/job/services/job-count.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { NodeService } from '@shared/domain/user-file/node.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { Job as BullJob } from 'bull'
import { NOTIFICATION_ACTION, SEVERITY } from '../../enums'
import * as errors from '../../errors'
import { PlatformClient } from '../../platform-client'
import {
  DnanexusLink,
  FileStateResult,
  FindJobsResponse,
  JobOutput,
} from '../../platform-client/platform-client.responses'
import { Maybe } from '../../types'
import { DxId } from '../entity/domain/dxid'
import { EventHelper } from '../event/event.helper'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../space-event/space-event.enum'
import { FILE_STATE_DX, PARENT_TYPE } from '../user-file/user-file.types'
import { JobRepository } from './job.repository'
import { ScopeFilterContext } from '@shared/domain/counters/counters.types'

@Injectable()
export class JobService implements SearchableByUid<'job'> {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: EntityManager,
    private readonly user: UserContext,
    private readonly platformClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly nodeService: NodeService,
    private readonly jobSyncService: JobSynchronizationService,
    private readonly emailService: EmailService,
    private readonly jobRepo: JobRepository,
    private readonly spaceRepo: SpaceRepository,
    private readonly spaceMembershipRepo: SpaceMembershipRepository,
    private readonly eventHelper: EventHelper,
    private readonly jobCountService: JobCountService,
  ) {}

  /**
   * Count jobs based on the given scope filter context
   */
  async countByScope(context: ScopeFilterContext): Promise<number> {
    return this.jobCountService.count(context)
  }

  getAccessibleEntityByUid(uid: Uid<'job'>): Promise<Job | null> {
    return this.jobRepo.findAccessibleOne({ uid })
  }

  getEditableEntityByUid(uid: Uid<'job'>): Promise<Job | null> {
    return this.jobRepo.findEditableOne({ uid })
  }

  getEditableEntityById(id: number): Promise<Job | null> {
    return this.jobRepo.findEditableOne({ id })
  }

  getAccessibleEntityById(id: number): Promise<Job | null> {
    return this.jobRepo.findAccessibleOne({ id })
  }

  async synchronizeJob(jobDxid: DxId<'job'>, bullJob: BullJob): Promise<Maybe<Job>> {
    return await this.jobSyncService.synchronizeJob(jobDxid, bullJob)
  }

  async findAccessible(dxid: DxId<'job'>): Promise<Job> {
    const job = await this.jobRepo.findAccessibleOne({ dxid })
    if (!job) {
      throw new errors.NotFoundError(`Job ${dxid} was not found or is not accessible`)
    }
    return job
  }

  async findAllRunningJobs(): Promise<Job[]> {
    return this.jobRepo.findAllRunningJobs()
  }

  async findRunningJobsByUser(): Promise<Job[]> {
    return this.jobRepo.findRunningJobsByUser({ userId: this.user.id })
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
      const outputFiles = await this.getOutputFiles(uniqueFileDxIds, projectDxId, user, job)

      await this.persistFiles(outputFiles, user)

      this.updateJobRunData(job, remappedOutput)

      if (job.isInSpace()) {
        // TODO temporarily before we move to Service model
        const spaceService = new SpaceEventService(
          this.user,
          this.em as SqlEntityManager,
          this.spaceRepo,
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
      const folders = await this.nodeService.createFoldersOnPath(
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
    projectDxid: DxId<'project'>,
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

      const fileEvent = await this.eventHelper.createFileEvent(
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
    projectDxId: DxId<'project'>,
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
    file.project = projectDxId
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
