import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { SyncDbClusterOperation } from '@shared/domain/db-cluster/ops/synchronize'
import { SyncJobOperation } from '@shared/domain/job/ops/synchronize'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import {
  FileUidInput,
  SyncFileJobInput,
  UidAndFollowUpInput,
} from '@shared/domain/user-file/user-file.input'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { CheckStatusJob, SyncDbClusterJob, TASK_TYPE } from '@shared/queue/task.input'
import { UserCtx } from '@shared/types'
import { JobOptions, Queue } from 'bull'

@Injectable()
export class MainQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.default.name)
    protected readonly queue: Queue,
  ) {
    super()
  }

  async createSyncFilesStateTask(user: UserCtx) {
    this.logger.log({ userId: user.id }, 'Creating SyncFilesStateTask')

    const task = {
      type: TASK_TYPE.SYNC_FILES_STATE as const,
      user,
    }

    const options: JobOptions = {
      // There should only be one sync files state task per user
      jobId: SyncFilesStateOperation.getBullJobId(user.dxuser),
      repeat: { cron: config.workerJobs.syncFiles.repeatPattern },
    }

    return await this.addToQueue(task, options)
  }

  async createSyncJobStatusTask(data: CheckStatusJob['payload'], user: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.SYNC_JOB_STATUS as const,
      payload: data,
      user,
    }
    // unique jobId ensures that every createTask call actually creates a new repeatable job
    // even with the same payload! -> have to clean up the queue correctly

    // We should prevent new sync jobs to be added
    //
    // If we use the dxid of the job as the Bull jobID, it would prevent repeated queueing but
    // it prevents future addition of this job after syncing has stopped.

    const options: JobOptions = {
      // There should only be one sync job task
      jobId: SyncJobOperation.getBullJobId(data.dxid),
      repeat: { cron: config.workerJobs.syncJob.repeatPattern },
    }

    return await this.addToQueue(wrapped, options)
  }

  async createRunFollowUpActionJobTask(payload: UidAndFollowUpInput, user?: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.FOLLOW_UP_ACTION as const,
      payload,
      user,
    }
    const options: JobOptions = {
      jobId: `${wrapped.type}.${payload.uid}.${new Date().getTime()}`,
    }

    await this.addToQueue(wrapped, options)
  }

  async createFileSynchronizeJobTask(
    payload: SyncFileJobInput,
    user?: UserCtx,
    delayInMs?: number,
  ) {
    const wrapped = {
      type: TASK_TYPE.SYNC_FILE_STATE as const,
      payload,
      user,
    }

    const options: JobOptions = {
      jobId: `${wrapped.type}.${payload.fileUid}`,
      delay: delayInMs ?? 0,
    }

    await this.addToQueue(wrapped, options)
  }

  async createCloseFileJobTask(payload: FileUidInput, user?: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.CLOSE_FILE as const,
      payload,
      user,
    }

    const options: JobOptions = {
      jobId: `${wrapped.type}.${payload.fileUid}`,
    }

    await this.addToQueue(wrapped, options)
  }

  async createDbClusterSyncTask(data: SyncDbClusterJob['payload'], user: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.SYNC_DBCLUSTER_STATUS as const,
      payload: data,
      user,
    }

    const options: JobOptions = {
      jobId: SyncDbClusterOperation.getBullJobId(data.dxid),
      repeat: { cron: config.workerJobs.syncDbClusters.repeatPattern },
    }

    return await this.addToQueue(wrapped, options)
  }
}
