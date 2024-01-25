import { SqlEntityManager } from '@mikro-orm/mysql'
import { Process, Processor } from '@nestjs/bull'
import { Inject } from '@nestjs/common'
import { config } from '@shared/config'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { JobService } from '@shared/domain/job/job.service'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import {
  UserDataConsistencyReportOperation
} from '@shared/domain/user/ops/user-data-consistency-report'
import { PlatformClient } from '@shared/platform-client'
import { CheckStatusJob, TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { lockNodesHandler } from '../../../jobs/lock-nodes.handler'
import { removeNodesHandler } from '../../../jobs/remove-nodes.handler'
import { SyncOutputsHandler } from '../../../jobs/sync-outputs.handler'
import { unlockNodesHandler } from '../../../jobs/unlock-nodes.handler'
import { workstationSyncFilesHandler } from '../../../jobs/workstation-sync-files.handler'
import { BaseQueueProcessor } from '../../../queues/processor/base-queue.processor'

@Processor(config.workerJobs.queues.fileSync.name)
export class FileSyncQueueProcessor extends BaseQueueProcessor {
  constructor(@Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager) {
    super()
  }

  @Process(TASK_TYPE.SYNC_JOB_OUTPUTS)
  async syncJobOutputs(job: Job<CheckStatusJob>) {
    // TODO following will be DI refactored
    const platformClient = new PlatformClient(job.data.user.accessToken)
    const jobService = new JobService(this.em, platformClient)
    const handler = new SyncOutputsHandler(this.em, jobService)

    await handler.handle(job as Job<CheckStatusJob>)
  }

  @Process(TASK_TYPE.SYNC_WORKSTATION_FILES)
  async syncWorkstationFiles(job: Job) {
    await workstationSyncFilesHandler(job)
  }

  @Process(TASK_TYPE.REMOVE_NODES)
  async removeNodes(job: Job) {
    await removeNodesHandler(job)
  }

  @Process(TASK_TYPE.LOCK_NODES)
  async lockNodes(job: Job) {
    await lockNodesHandler(job)
  }

  @Process(TASK_TYPE.UNLOCK_NODES)
  async unlockNodes(job: Job) {
    await unlockNodesHandler(job)
  }

  @Process(TASK_TYPE.WORKSTATION_SNAPSHOT)
  async createWorkstationSnapshot(job: Job) {
    await this.handleUserTask(job, async (ctx, input) => {
      return await new WorkstationSnapshotOperation(ctx).execute(input)
    })
  }

  @Process(TASK_TYPE.USER_DATA_CONSISTENCY_REPORT)
  async reportUserDataConsistency(job: Job) {
    return await this.handleUserTask(job, async (ctx) => {
      return await new UserDataConsistencyReportOperation(ctx).execute()
    })
  }
}
