import { wrap } from '@mikro-orm/core'
import { difference, map, prop } from 'ramda'
import { CheckStatusJob } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
import { getJobSubtype, isStateTerminal, shouldSyncStatus } from '../job.helper'
import * as client from '../../../platform-client'
import { removeRepeatable } from '../../../queue'
import type { Maybe } from '../../../types'
import { UserFile } from '../../user-file'
import { User } from '../..'
import { FILE_STATE, FILE_STI_TYPE, FILE_TYPE, PARENT_TYPE } from '../../user-file/user-file.enum'
import { APP_HTTPS_SUBTYPE } from '../../app/app.enum'

export class SyncJobOperation extends WorkerBaseOperation<CheckStatusJob['payload'], Job> {
  protected user: User
  protected job: Job

  async run(input: CheckStatusJob['payload']): Promise<Maybe<Job>> {
    const em = this.ctx.em
    const jobRepo = em.getRepository(Job)
    const filesRepo = em.getRepository(UserFile)
    const job = await jobRepo.findOne({ dxid: input.dxid })
    const user = await em.findOne(User, { id: this.ctx.user.id })

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
    this.job = job
    this.user = user

    // todo: check users ownership -> we should have a helper for it
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
      // fetch all files related to the app
      const localfiles = await filesRepo.findProjectFiles({ project: job.project })
      // fetch all files on the platform
      const filesInProject = await client.filesList({
        accessToken: this.ctx.user.accessToken,
        project: job.project,
      })
      // todo: this should only run if the app type is Jupyter
      // fetch snapshots on the platform
      const snapshotsInProject = await client.filesList({
        accessToken: this.ctx.user.accessToken,
        project: job.project,
        folder: '/.Notebook_snapshots',
      })
      // compare check differences
      const remoteFileIds = map(prop('id'))(filesInProject.results)
      const snapshotFileIds = map(prop('id'))(snapshotsInProject.results)
      const regularFileIds = difference(remoteFileIds, snapshotFileIds)
      this.ctx.log.info({ regularFileIds, snapshotFileIds }, 'Remote state file ids')

      if (getJobSubtype(job, user) !== APP_HTTPS_SUBTYPE.JUPYTER && snapshotFileIds.length > 0) {
        this.ctx.log.warn(
          { jobId: job.id, jobType: getJobSubtype(job, user), snapshotFileIds },
          'Job type is not Jupyter but snapshots were discovered on the platfrom',
        )
      }

      const localFileIds = map(prop('dxid'))(localfiles)
      const newRegularFileIds = difference(regularFileIds, localFileIds)
      const newSnapshotFileIds = difference(snapshotFileIds, localFileIds)
      this.ctx.log.info({ newRegularFileIds, newSnapshotFileIds }, 'Discovered newly created files')

      // ask the API for info about new files
      const newFilesData = await client.filesDescribe({
        accessToken: this.ctx.user.accessToken,
        fileIds: newRegularFileIds.concat(newSnapshotFileIds),
      })
      // build regular files in DB
      newRegularFileIds.forEach(fileId => {
        const apiResponse = newFilesData.results.find(data => fileId === data.describe.id)
        if (!apiResponse) {
          this.ctx.log.warn({ fileId }, 'File was not found in the API response')
          return
        }
        const file = this.createUserFile(fileId, apiResponse, false)
        em.persist(file)
      })
      // build snapshot files in DB
      newSnapshotFileIds.forEach(fileId => {
        const apiResponse = newFilesData.results.find(data => fileId === data.describe.id)
        if (!apiResponse) {
          this.ctx.log.warn({ fileId }, 'File was not found in the API response')
          return
        }
        const file = this.createUserFile(fileId, apiResponse, true)
        em.persist(file)
      })
      // store them in the database
      await em.flush()
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

  private createUserFile(fileId: string, apiResponse, isSnapshot: boolean): UserFile {
    const userFile = new UserFile(this.user)
    wrap(userFile).assign({
      dxid: fileId,
      project: this.job.project,
      state: FILE_STATE.CLOSED,
      name: apiResponse.describe.name,
      userId: this.user.id,
      scope: this.job.scope ?? 'private',
      fileSize: apiResponse.describe.size,
      parentId: this.job.id,
      parentType: PARENT_TYPE.JOB,
      parentFolderId: this.job.localFolderId,
      uid: `${fileId}-1`,
      stiType: FILE_STI_TYPE.USERFILE,
      entityType: isSnapshot ? FILE_TYPE.SNAPSHOT : FILE_TYPE.REGULAR,
    })
    return userFile
  }
}
