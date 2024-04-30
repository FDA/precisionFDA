import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { InvalidStateError } from '@shared/errors'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { getJobStatusMessage } from '@shared/queue/queue.utils'
import { CheckStatusJob, Task, TASK_TYPE } from '@shared/queue/task.input'
import { UserCtx } from '@shared/types'
import { formatDuration } from '@shared/utils/format'
import { JobOptions, Queue } from 'bull'

@Injectable()
export class FileSyncQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.fileSync.name)
    protected readonly queue: Queue,
  ) {
    super()
  }

  async createSyncOutputsTask(data: CheckStatusJob['payload'], user: UserCtx) {
    const wrapped: CheckStatusJob = {
      type: TASK_TYPE.SYNC_JOB_OUTPUTS,
      payload: data,
      user,
    }
    await this.createSyncTask(wrapped, data.dxid)
  }

  async createRemoveNodesJobTask(ids: number[], user: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.REMOVE_NODES as const,
      payload: ids,
      user,
    }
    const options: JobOptions = {
      jobId: `${wrapped.type}.${user.dxuser}-${+new Date()}`,
    }
    return await this.addToQueue(wrapped, options)
  }

  async createLockNodesJobTask(ids: number[], user: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.LOCK_NODES as const,
      payload: ids,
      user,
    }
    const options: JobOptions = {
      jobId: `${wrapped.type}.${user.dxuser}-${+new Date()}`,
    }
    return await this.addToQueue(wrapped, options)
  }

  async createUnlockNodesJobTask(ids: number[], user: UserCtx) {
    const wrapped = {
      type: TASK_TYPE.UNLOCK_NODES as const,
      payload: ids,
      user,
    }
    const options: JobOptions = {
      jobId: `${wrapped.type}.${user.dxuser}-${+new Date()}`,
    }
    return await this.addToQueue(wrapped, options)
  }

  private async createSyncTask<T extends Task>(task: T, dxid: string) {
    const jobId = `${task.type}.${dxid}`
    const existingJob = await this.queue.getJob(jobId)
    if (existingJob !== null) {
      // Do not allow a second file sync job to be added to the queue
      let errorMessage = await getJobStatusMessage(existingJob, 'File sync')
      const elapsedTime = Date.now() - existingJob.timestamp
      errorMessage += `. Current state is ${await existingJob.getState()}`
      errorMessage += `. Elapsed time ${formatDuration(elapsedTime)}`
      throw new InvalidStateError(errorMessage)
    }

    // This is a user triggered task, and should not be repeated
    const options: JobOptions = {
      jobId,
    }

    return await this.addToQueue(task, options)
  }
}
