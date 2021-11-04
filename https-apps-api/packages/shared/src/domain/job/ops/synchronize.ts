import { wrap } from '@mikro-orm/core'
import { isNil } from 'ramda'
import { CheckStatusJob } from '../../../queue/task.input'
import { WorkerBaseOperation } from '../../../utils/base-operation'
import { Job } from '../job.entity'
import {
  buildIsOverMaxDuration,
  isStateActive,
  isStateTerminal,
  shouldSyncStatus,
} from '../job.helper'
import { PlatformClient, JobDescribeResponse } from '../../../platform-client'
import { createSendEmailTask, removeRepeatable } from '../../../queue'
import type { Maybe } from '../../../types'
import { User, Tagging, UserFile, Tag, Folder } from '../..'
import { errors } from '../../..'
import { FILE_ORIGIN_TYPE, PARENT_TYPE } from '../../user-file/user-file.enum'
import { createJobClosed } from '../../event/event.helper'
import {
  SyncFilesInFolderOperation,
  SyncFolderFilesOutput,
  SyncFoldersOperation,
  helper,
} from '../../user-file'
import { RequestTerminateJobOperation } from '..'
import {
  JobStaleInputTemplate,
  jobStaleTemplate,
} from '../../email/templates/mjml/job-stale.handler'
import { buildEmailTemplate } from '../../email/email.helper'
import { EmailSendInput } from '../../email/email.config'

export class SyncJobOperation extends WorkerBaseOperation<CheckStatusJob['payload'], Maybe<Job>> {
  protected user: User
  protected job: Job
  protected client: PlatformClient

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
    this.client = new PlatformClient(this.ctx.log)
    this.ctx.log.info({ jobId: job.id }, 'processing job')

    if (!shouldSyncStatus(job)) {
      this.ctx.log.info({ input, job }, 'Job is already finished')
      await removeRepeatable(this.ctx.job)
      return
    }
    // we want to synchronize the job status if it is not yet terminated
    let platformJobData: JobDescribeResponse
    try {
      platformJobData = await this.client.jobDescribe({
        jobId: input.dxid,
        accessToken: this.ctx.user.accessToken,
      })
    } catch (err) {
      if (err instanceof errors.ClientRequestError) {
        // we retrieved response status code
        if (err.props?.clientStatusCode && err.props?.clientStatusCode >= 500) {
          // there was an error on platform side, we will retry later
          this.ctx.log.info('Will not remove this job - 5xx error code detected')
          return
        }
      }

      this.ctx.log.info('Removing sync job task')
      // handle WORKER dirty state here
      // we could do more efficient error handling and also calls repetition here
      await removeRepeatable(this.ctx.job)
      return
    }

    const isOverNotifyMaxDuration = buildIsOverMaxDuration('notify')
    const isOverTerminateMaxDuration = buildIsOverMaxDuration('terminate')
    if (
      isStateActive(job.state) &&
      isOverNotifyMaxDuration(job) &&
      !isOverTerminateMaxDuration(job)
    ) {
      await this.sendTerminationEmail()
    }
    if (isStateActive(job.state) && isOverTerminateMaxDuration(job)) {
      this.ctx.log.info({ jobId: job.id }, 'Job marked as stale, trying to terminate')
      const terminateOp = new RequestTerminateJobOperation({
        log: this.ctx.log,
        em: this.ctx.em,
        user: this.ctx.user,
      })
      await terminateOp.execute({ dxid: job.dxid })
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
      const projectDesc = await this.client.foldersList({
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
      // for each local folder query files and check for differences
      // null is added -> root folder
      const folderPathsToCheck: Array<Folder | null> = [null, ...localFolders]
      const fileDeletesSeq = async (): Promise<void> => {
        for (const folder of folderPathsToCheck) {
          // !!!
          const syncFilesEm = this.ctx.em.fork(true)
          const syncFilesInFolderOp = new SyncFilesInFolderOperation({
            log: this.ctx.log,
            // operations run in parallel, they should have their own DB context
            em: syncFilesEm,
            user: this.ctx.user,
          })
          // eslint-disable-next-line no-await-in-loop
          await syncFilesInFolderOp.execute({
            folderId: !isNil(folder) ? folder.id : null,
            projectDxid: job.project,
            scope: job.scope,
            parentType: PARENT_TYPE.JOB,
            parentId: job.id,
            entityType: FILE_ORIGIN_TYPE.HTTPS,
            runRemove: true,
            runAdd: false,
          })
          // syncFilesResp.push(res)
        }
      }
      const syncFilesResp: SyncFolderFilesOutput[] = []
      await fileDeletesSeq()

      const fileAddsSeq = async (): Promise<void> => {
        for (const folder of folderPathsToCheck) {
          // !!!
          const syncFilesEm = this.ctx.em.fork(true)
          const syncFilesInFolderOp = new SyncFilesInFolderOperation({
            log: this.ctx.log,
            // operations run in parallel, they should have their own DB context
            em: syncFilesEm,
            user: this.ctx.user,
          })
          // eslint-disable-next-line no-await-in-loop
          const res = await syncFilesInFolderOp.execute({
            folderId: !isNil(folder) ? folder.id : null,
            projectDxid: job.project,
            scope: job.scope,
            parentType: PARENT_TYPE.JOB,
            parentId: job.id,
            entityType: FILE_ORIGIN_TYPE.HTTPS,
            runRemove: false,
            runAdd: true,
          })
          syncFilesResp.push(res)
        }
      }
      await fileAddsSeq()

      const httpsFilesTag = await em.getRepository(Tag).findOneOrCreate('HTTPS File')
      const jupyterSnapshotTag = await em.getRepository(Tag).findOneOrCreate('Jupyter Snapshot')
      const createdFolderTags = await this.assignTags(localFolders, httpsFilesTag)
      httpsFilesTag.taggingCount += createdFolderTags
      await Promise.all(
        syncFilesResp.map(async ({ folderPath, files }) => {
          // files were created in a different identity map
          em.persist(files)
          // extra action based on folderPath happens here
          if (folderPath.includes('/.Notebook_snapshots')) {
            const newSnapshotTagsCnt = await this.assignTags(files, jupyterSnapshotTag)
            jupyterSnapshotTag.taggingCount += newSnapshotTagsCnt
            // this.changeEntityType(files)
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

  private async sendTerminationEmail(): Promise<void> {
    // send email to job owner
    const body = buildEmailTemplate<JobStaleInputTemplate>(jobStaleTemplate, {
      receiver: this.user,
      content: { job: { id: this.job.id, name: this.job.name, uid: this.job.uid } },
    })
    const email: EmailSendInput = {
      to: this.user.email,
      subject: `precisionFDA Workstation ${this.job.name} will terminate in 24 hours`,
      body,
    }
    await createSendEmailTask(email, this.ctx.user)
  }

  private async assignTags(nodes: Array<UserFile | Folder>, tag: Tag): Promise<number> {
    const em = this.ctx.em.fork(true)
    const taggingRepo = em.getRepository(Tagging)
    const existingRefs = await taggingRepo.findForFiles({
      fileIds: nodes.map(f => f.id),
      tagId: tag.id,
      userId: this.ctx.user.id,
    })
    let createdTags = 0
    nodes.forEach(node => {
      const existing = existingRefs.find(tagging => tagging.taggableId === node.id)
      if (!isNil(existing)) {
        return
      }
      const tagging = taggingRepo.upsertForFile({
        tagId: tag.id,
        fileId: node.id,
        userId: this.ctx.user.id,
        nodeType: helper.getStiEnumTypeFromInstance(node),
      })
      // tagging.tag.taggingCount++
      node.taggings.add(tagging)
      em.persist(tagging)
      createdTags++
    })
    await em.flush()
    return createdTags
  }
}
