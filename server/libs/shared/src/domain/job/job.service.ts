import { SqlEntityManager } from '@mikro-orm/mysql'
import { getLogger } from '../../logger'
import { PlatformClient } from '../../platform-client'
import { EntityManager } from '@mikro-orm/core'
import { FILE_STATE_DX, PARENT_TYPE } from '../user-file/user-file.types'
import { NotificationService} from '../notification'
import { NOTIFICATION_ACTION, SEVERITY, STATIC_SCOPE } from '../../enums'
import { createFileEvent, EVENT_TYPES } from '../event/event.helper'
import {
  DnanexusLink,
  FileStateResult,
  JobOutput,
} from '../../platform-client/platform-client.responses'
import { Job, User, UserFile, Folder, spaceEvent } from '..'
import type { UserCtx } from '../../types'
import * as errors from '../../errors'
import { getIdFromScopeName, scopeContainsId } from '../space/space.helper'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../space-event/space-event.enum'
import { JobRepository } from './job.repository'
import { UserRepository } from '../user/user.repository'
import { FolderService } from '../user-file/folder.service'

const logger = getLogger('job.service')

export interface IJobService {
  syncOutputs(jobDxId: string, userId: number): Promise<void>
}
export class JobService implements IJobService {
  private readonly em: EntityManager
  private readonly platformClient: PlatformClient
  private readonly notificationService: NotificationService
  private readonly folderService: FolderService
  private jobRepo: JobRepository
  private userRepo: UserRepository

  constructor(em: EntityManager, platformClient: PlatformClient) {
    this.em = em
    this.platformClient = platformClient
    this.notificationService = new NotificationService(em as SqlEntityManager)
    this.folderService = new FolderService(em as SqlEntityManager)
    this.jobRepo = this.em.getRepository(Job)
    this.userRepo = this.em.getRepository(User)
  }

  /**
   * Gets non-terminal jobs for the challenge user.
   */
  async getNonTerminalJobs(userId: number): Promise<Job[]> {
    const user = this.userRepo.getReference(userId)
    return await this.jobRepo.find(
      { user },
      { filters: ['isNonTerminal'] },
    )
  }

  /**
   * Synchronizes outputs for a job. This method has to be run after job completes.
   * It stores data about job outputs in the database, creates files and file events.
   *
   * previously the code was in job_syncing.rb
   *
   * @param jobDxId
   * @param userId
   */
  async syncOutputs(jobDxId: string, userId: number): Promise<void> {
    logger.info(`JobService: syncing output files for job ${jobDxId}`)

    const user = await this.userRepo.findOneOrFail({ id: userId })
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

      if (scopeContainsId(job.scope)) {
        await this.createSpaceEvent(job, userId)
      }

      await this.createNotification(jobDxId, userId)
      await this.em.commit()
      logger.info(`JobService: outputs for job ${jobDxId} have been synchronized`)
    } catch (error) {
      logger.error('JobService: error synchronizing outputs', error)
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

  private updateJobRunData(job: Job, output: JobOutput) {
    job.runData.run_outputs = output
    // describe is updated by job's synchronize.ts
    this.em.persist(job)
  }

  private async createSpaceEvent(job: Job, userId: number) {
    const spaceId = getIdFromScopeName(job.scope)
    const eventOp = new spaceEvent.CreateSpaceEventOperation({
      user: { id: userId } as UserCtx,
      em: this.em as SqlEntityManager,
      log: logger,
    })
    await eventOp.execute({
      entity: { type: 'job', value: job },
      spaceId,
      userId,
      activityType: SPACE_EVENT_ACTIVITY_TYPE.job_completed,
    })
  }

  private async getOutputFiles(fileDxids: string[], projectDxid: string, user: User, job: Job): Promise<UserFile[]> {
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

  private async createNotification(jobDxId: string, userId: number) {
    await this.notificationService.createNotification({
      message: `Outputs for job ${jobDxId} have been synchronized`,
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.JOB_OUTPUTS_SYNCED,
      userId,
    })
  }

  private async persistFiles(outputFiles: any[], user: User) {
    const filePromises = outputFiles.map(async outputFile => {
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

  private async getJobResult(job: Job) {
    const result = await this.platformClient.jobFind({
      id: [job.dxid],
      project: job.project,
      describe: true,
    })
    if (result.results.length !== 1) {
      throw new errors.InvalidStateError(`Incorrect number of results for job ${job.dxid}`)
    }
    return result
  }

  private createFile(user: User, projectDxId: string, fileStateResult: FileStateResult, job: Job, parentFolder: Folder | null) {
    if (!fileStateResult.describe) {
      throw new errors.InvalidStateError(`Platform didn't give describe for file id ${fileStateResult.id}`)
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
      if (scopeContainsId(file.scope)) {
        file.scopedParentFolderId = parentFolder.id
      } else {
        file.parentFolderId = parentFolder.id
      }
    } else if (job.localFolderId) {
      if (scopeContainsId(file.scope)) {
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
   * @param output
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

  private remapArrayOfFiles(value: DnanexusLink[], output: JobOutput, key: string) {
    const linkArray: string[] = []
    value.forEach(item => {
      if (this.isDnaNexusLink(item)) {
        linkArray.push(item.$dnanexus_link)
      }
    })
    if (linkArray.length > 0) {
      output[key] = linkArray
    }
  }

  private collectIds(output: JobOutput) {
    const uniqueFileDxIds = new Set<string>()
    for (const key in output) {
      if (output.hasOwnProperty(key)) {
        const value = output[key]
        if (Array.isArray(value)) {
          value.forEach(item => {
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
