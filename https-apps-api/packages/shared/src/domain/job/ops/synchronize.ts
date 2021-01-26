import { wrap } from '@mikro-orm/core'
import { difference, isNil } from 'ramda'
import { CheckStatusJob } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
import { isStateTerminal, shouldSyncStatus } from '../job.helper'
import * as client from '../../../platform-client'
import { removeRepeatable } from '../../../queue'
import type { Maybe } from '../../../types'
import { User, Tagging, UserFile, Tag, Folder } from '../..'
import { errors } from '../../..'
import { FILE_STATE, FILE_STI_TYPE, FILE_TYPE, PARENT_TYPE } from '../../user-file/user-file.enum'
import { createJobClosed } from '../../event/event.helper'
import {
  SyncFilesInFolderOperation,
  SyncFolderFilesOutput,
  SyncFoldersOperation,
} from '../../user-file'

type FilesByFolder = Pick<SyncFolderFilesOutput, 'folder' | 'folderPath'> & { files: UserFile[] }

export class SyncJobOperation extends WorkerBaseOperation<CheckStatusJob['payload'], Maybe<Job>> {
  protected user: User
  protected job: Job

  async run(input: CheckStatusJob['payload']): Promise<Maybe<Job>> {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const job = await jobRepo.findOne({ dxid: input.dxid })
    const user = await em.findOne(User, { id: this.ctx.user.id })

    // check input data
    if (!job) {
      this.ctx.log.warn({ input }, 'Job does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }
    if (!user) {
      this.ctx.log.warn({ input }, 'User does not exist')
      await removeRepeatable(this.ctx.job)
      return
    }
    // todo: check users ownership -> we should have a helper for it
    this.job = job
    this.user = user

    if (!shouldSyncStatus(job)) {
      this.ctx.log.info({ input, job }, 'Job is already finished')
      await removeRepeatable(this.ctx.job)
      return
    }
    // we want to synchronize the job status if it is not yet terminated
    let platformJobData: client.JobDescribeResponse
    try {
      platformJobData = await client.jobDescribe({
        jobId: input.dxid,
        accessToken: this.ctx.user.accessToken,
      })
    } catch (err) {
      // handle WORKER dirty state here
      // we could do more efficient error handling and also calls repetition here
      await removeRepeatable(this.ctx.job)
      return
    }

    // fixme: the mapping is not perfect for the https apps
    const remoteState = platformJobData.state
    if (remoteState === job.state) {
      this.ctx.log.info({ remoteState }, 'State has not changed, no updates')
      return
    }

    if (isStateTerminal(remoteState)) {
      this.ctx.log.debug({ remoteState }, 'We will do lots of updates')
      // create jobClosed event
      const eventEntity = await createJobClosed(user, job)
      em.persist(eventEntity)

      // FOLDERS AND FILES SYNC
      const projectDesc = await client.foldersList({
        projectId: job.project,
        accessToken: this.ctx.user.accessToken,
      })
      const syncFoldersOp = new SyncFoldersOperation({
        log: this.ctx.log,
        em: this.ctx.em,
        user: this.ctx.user,
      })
      const localFolders = await syncFoldersOp.execute({
        remoteFolderPaths: projectDesc.folders,
        scope: job.scope,
        parentId: job.id,
        parentType: PARENT_TYPE.JOB,
        projectDxid: job.project,
      })
      const httpsFilesTag = await em.getRepository(Tag).findOneOrCreate('HTTPS File')
      const jupyterSnapshotTag = await em.getRepository(Tag).findOneOrCreate('Jupyter Snapshot')
      // for each local folder query files and check for differences
      // null is added -> root folder
      const folderPathsToCheck: Array<Folder | null> = [null, ...localFolders]
      const syncFilesResp = await Promise.all(
        folderPathsToCheck.map(async (folder: Folder | null) => {
          const syncFilesInFolderOp = new SyncFilesInFolderOperation({
            log: this.ctx.log,
            // operations run in parallel, they should have their own DB context
            em: this.ctx.em.fork(false),
            user: this.ctx.user,
          })
          return await syncFilesInFolderOp.execute({
            folderId: folder ? folder.id : null,
            projectDxid: job.project,
            scope: job.scope,
            parentType: PARENT_TYPE.JOB,
            parentId: job.id,
            entityType: FILE_TYPE.REGULAR,
          })
        }),
      )
      // handle dxids to remove
      const filesToRemove = ([] as string[]).concat(...syncFilesResp.map(res => res.toRemove))
      await this.removeLocalFiles(filesToRemove)
      await em.flush()
      // more complex
      const fileUpdates = await this.addLocalFiles(syncFilesResp)
      await em.flush()
      // load all the local files per subfolder
      const localFiles = await this.loadFilesPerFolder(fileUpdates)

      await Promise.all(
        localFiles.map(async ({ folderPath, files }) => {
          // const helperEm: any = this.ctx.em.fork(false)
          // extra action based on folderPath happens here
          if (folderPath.includes('/.Notebook_snapshots')) {
            const newSnapshotTagsCnt = await this.assignTags(files, jupyterSnapshotTag)
            jupyterSnapshotTag.taggingCount += newSnapshotTagsCnt
            this.changeEntityType(files)
          }
          // all files get this for now
          const newHttpsTagsCnt = await this.assignTags(files, httpsFilesTag)
          httpsFilesTag.taggingCount += newHttpsTagsCnt
        }),
      )
      await em.flush()
      // FOLDERS AND FILES SYNC END
    }
    this.ctx.log.info({ jobId: input.dxid }, 'Updating job, state change discovered')
    const updatedJob = wrap(job).assign(
      {
        describe: JSON.stringify(platformJobData),
        state: platformJobData.state,
      },
      { em },
    )
    await em.flush()
    this.ctx.log.debug({ job: updatedJob }, 'updated job')
  }

  private async addLocalFiles(input: SyncFolderFilesOutput[]): Promise<FilesByFolder[]> {
    const filesToCreate = ([] as string[]).concat(...input.map(res => res.toAdd))
    // API call can be shared
    if (filesToCreate.length === 0) {
      return input.map(res => ({
        folder: res.folder,
        folderPath: res.folderPath,
        // for this state, just a placeholder
        files: [],
      }))
    }
    const filesDesc = await client.filesDescribe({
      accessToken: this.ctx.user.accessToken,
      fileIds: filesToCreate,
    })
    return await Promise.all(
      input.map(async res => {
        const current = res.folder
        const newInFolder = res.toAdd.map(dxid => {
          const details = filesDesc.results.find(f => f.describe.id === dxid)
          if (!details) {
            throw new errors.NotFoundError('File not found in the filesDescribe response', {
              details: { dxid },
            })
          }
          const folderOrUndef = !isNil(current) ? current : undefined
          return wrap(new UserFile(this.user, folderOrUndef)).assign(
            {
              dxid: details.describe.id,
              project: this.job.project,
              parentFolder: !isNil(current) ? wrap(current).toReference() : undefined,
              // these two should be resolved separately - could be User | Job
              parentType: PARENT_TYPE.JOB,
              parentId: this.job.id,
              // parent: em.getReference(Job, input.parentId),
              state: FILE_STATE.CLOSED,
              name: details.describe.name,
              userId: this.user.id,
              scope: this.job.scope,
              fileSize: details.describe.size,
              uid: `${details.describe.id}-1`,
              stiType: FILE_STI_TYPE.USERFILE,
              entityType: FILE_TYPE.REGULAR,
            },
            { em: this.ctx.em },
          )
        })
        this.ctx.em.persist(newInFolder)
        return {
          folder: res.folder,
          folderPath: res.folderPath,
          // for this state, just a placeholder
          files: [],
        }
      }),
    )
  }

  private async loadFilesPerFolder(input: FilesByFolder[]): Promise<FilesByFolder[]> {
    return await Promise.all(
      input.map(async res => {
        const em = this.ctx.em.fork(false)
        const fileRepo = em.getRepository(UserFile)
        const files = await fileRepo.findProjectFilesInSubfolder({
          project: this.job.project,
          folderId: isNil(res.folder) ? null : res.folder.id,
        })
        return {
          ...res,
          files,
        }
      }),
    )
  }

  // just makes changes in the em
  private async removeLocalFiles(fileIds: string[]): Promise<void> {
    if (fileIds.length === 0) {
      return
    }
    const filesRepo = this.ctx.em.getRepository(UserFile)
    const localFiles = await filesRepo.find(
      { dxid: { $in: fileIds } },
      { populate: ['taggings.tag'] },
    )
    if (localFiles.length > fileIds.length) {
      throw new errors.NotFoundError('Some Local user files to delete were not found', {
        details: {
          missingDxids: difference(
            fileIds,
            localFiles.map(lf => lf.dxid),
          ),
        },
      })
    }
    filesRepo.removeFilesWithTags(localFiles)
  }

  private changeEntityType(files: UserFile[]): void {
    files.forEach(file => {
      file.entityType = FILE_TYPE.SNAPSHOT
    })
  }

  private async assignTags(files: UserFile[], tag: Tag): Promise<number> {
    // const em = this.ctx.em
    const em = this.ctx.em.fork(true)
    const taggingRepo = em.getRepository(Tagging)
    const existingRefs = await taggingRepo.findForFiles({
      fileIds: files.map(f => f.id),
      tagId: tag.id,
      userId: this.ctx.user.id,
    })
    let createdTags = 0
    files.forEach(file => {
      const existing = existingRefs.find(tagging => tagging.taggableId === file.id)
      if (!isNil(existing)) {
        return
      }
      const tagging = taggingRepo.upsertForFile({
        tagId: tag.id,
        fileId: file.id,
        userId: this.ctx.user.id,
      })
      // tagging.tag.taggingCount++
      file.taggings.add(tagging)
      em.persist(tagging)
      createdTags++
    })
    await em.flush()
    return createdTags
  }
}
