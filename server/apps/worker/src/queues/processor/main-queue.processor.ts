import { Process, Processor } from '@nestjs/bull'
import { config, queue, userFile } from '@shared'
import { Job } from 'bull'
import { dbClusterSyncHandler } from '../../jobs/db-cluster-sync.handler'
import { jobStatusHandler } from '../../jobs/job-status.handler'
import { BaseQueueProcessor } from './base-queue.processor'

@Processor(config.workerJobs.queues.default.name)
export class MainQueueProcessor extends BaseQueueProcessor {
  @Process(queue.types.TASK_TYPE.SYNC_FILES_STATE)
  async syncFileState(job: Job) {
    await this.handleUserTask(job, async (ctx, input) => {
      return await new userFile.SyncFilesStateOperation(ctx).execute(input)
    })
  }

  @Process(queue.types.TASK_TYPE.SYNC_JOB_STATUS)
  async syncJobStatus(job: Job) {
    await jobStatusHandler(job)
  }

  @Process(queue.types.TASK_TYPE.SYNC_DBCLUSTER_STATUS)
  async syncDbClusterStatus(job: Job) {
    await dbClusterSyncHandler(job)
  }
}
