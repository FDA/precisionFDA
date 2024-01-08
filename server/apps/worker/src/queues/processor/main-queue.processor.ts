import { Process, Processor } from '@nestjs/bull'
import { config } from '@shared/config'
import { SyncFilesStateOperation } from '@shared/domain/user-file/ops/sync-files-state'
import { TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { dbClusterSyncHandler } from '../../jobs/db-cluster-sync.handler'
import { jobStatusHandler } from '../../jobs/job-status.handler'
import { BaseQueueProcessor } from './base-queue.processor'

@Processor(config.workerJobs.queues.default.name)
export class MainQueueProcessor extends BaseQueueProcessor {
  @Process(TASK_TYPE.SYNC_FILES_STATE)
  async syncFileState(job: Job) {
    await this.handleUserTask(job, async (ctx, input) => {
      return await new SyncFilesStateOperation(ctx).execute(input)
    })
  }

  @Process(TASK_TYPE.SYNC_JOB_STATUS)
  async syncJobStatus(job: Job) {
    await jobStatusHandler(job)
  }

  @Process(TASK_TYPE.SYNC_DBCLUSTER_STATUS)
  async syncDbClusterStatus(job: Job) {
    await dbClusterSyncHandler(job)
  }
}
