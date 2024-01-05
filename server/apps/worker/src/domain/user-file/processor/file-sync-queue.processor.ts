import { SqlEntityManager } from '@mikro-orm/mysql'
import { Process, Processor } from '@nestjs/bull'
import { Inject } from '@nestjs/common'
import { config, DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, queue, user } from '@shared'
import { CheckStatusJob } from '@shared/queue/task.input'
import { Job } from 'bull'
import { client, job as jobDomain } from '@shared'
import { lockNodesHandler } from '../../../jobs/lock-nodes.handler'
import { removeNodesHandler } from '../../../jobs/remove-nodes.handler'
import { SyncOutputsHandler } from '../../../jobs/sync-outputs.handler'
import { unlockNodesHandler } from '../../../jobs/unlock-nodes.handler'
import { workstationSyncFilesHandler } from '../../../jobs/workstation-sync-files.handler'
import { BaseQueueProcessor } from '../../../queues/processor/base-queue.processor'

@Processor(config.workerJobs.queues.fileSync.name)
export class FileSyncQueueProcessor extends BaseQueueProcessor {
  constructor(@Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager) {
    super()
  }

  @Process(queue.types.TASK_TYPE.SYNC_JOB_OUTPUTS)
  async syncJobOutputs(job: Job<CheckStatusJob>) {
    // TODO following will be DI refactored
    const platformClient = new client.PlatformClient(job.data.user.accessToken)
    const jobService = new jobDomain.JobService(this.em, platformClient)
    const handler = new SyncOutputsHandler(this.em, jobService)

    await handler.handle(job as Job<CheckStatusJob>)
  }

  @Process(queue.types.TASK_TYPE.SYNC_WORKSTATION_FILES)
  async syncWorkstationFiles(job: Job) {
    await workstationSyncFilesHandler(job)
  }

  @Process(queue.types.TASK_TYPE.REMOVE_NODES)
  async removeNodes(job: Job) {
    await removeNodesHandler(job)
  }

  @Process(queue.types.TASK_TYPE.LOCK_NODES)
  async lockNodes(job: Job) {
    await lockNodesHandler(job)
  }

  @Process(queue.types.TASK_TYPE.UNLOCK_NODES)
  async unlockNodes(job: Job) {
    await unlockNodesHandler(job)
  }

  @Process(queue.types.TASK_TYPE.WORKSTATION_SNAPSHOT)
  async createWorkstationSnapshot(job: Job) {
    await this.handleUserTask(job, async (ctx, input) => {
      return await new jobDomain.WorkstationSnapshotOperation(ctx).execute(input)
    })
  }

  @Process(queue.types.TASK_TYPE.USER_DATA_CONSISTENCY_REPORT)
  async reportUserDataConsistency(job: Job) {
    return await this.handleUserTask(job, async (ctx) => {
      return await new user.UserDataConsistencyReportOperation(ctx).execute()
    })
  }
}
