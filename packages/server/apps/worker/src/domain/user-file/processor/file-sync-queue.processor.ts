import { Processor } from '@nestjs/bull'
import { config } from '@shared/config'
import { JobService } from '@shared/domain/job/job.service'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import { CheckStatusJob, TASK_TYPE } from '@shared/queue/task.input'
import { Job } from 'bull'
import { lockNodesHandler } from '../../../jobs/lock-nodes.handler'
import { unlockNodesHandler } from '../../../jobs/unlock-nodes.handler'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'
import { BaseQueueProcessor } from '../../../queues/processor/base-queue.processor'
import { UserDataConsistencyReportService } from '@shared/domain/user/user-data-consistency-report.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'

@Processor(config.workerJobs.queues.fileSync.name)
export class FileSyncQueueProcessor extends BaseQueueProcessor {
  constructor(
    private readonly userDataConsistencyReportService: UserDataConsistencyReportService,
    private readonly userFileService: UserFileService,
    private readonly jobServiceWithPlatformClient: JobService,
  ) {
    super()
  }

  @ProcessWithContext(TASK_TYPE.SYNC_JOB_OUTPUTS)
  async syncJobOutputs(job: Job<CheckStatusJob>) {
    await this.jobServiceWithPlatformClient.syncOutputs(job.data.payload.dxid, job.data.user.id)
  }

  @ProcessWithContext(TASK_TYPE.REMOVE_NODES)
  async removeNodes(job: Job) {
    const ids: number[] = job.data.payload as number[]
    await this.userFileService.removeNodes(ids, true)
  }

  @ProcessWithContext(TASK_TYPE.LOCK_NODES)
  async lockNodes(job: Job) {
    await lockNodesHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.UNLOCK_NODES)
  async unlockNodes(job: Job) {
    await unlockNodesHandler(job)
  }

  @ProcessWithContext(TASK_TYPE.WORKSTATION_SNAPSHOT)
  async createWorkstationSnapshot(job: Job) {
    await this.handleUserTask(job, async (ctx, input) => {
      return await new WorkstationSnapshotOperation(ctx).execute(input)
    })
  }

  @ProcessWithContext(TASK_TYPE.USER_DATA_CONSISTENCY_REPORT)
  async reportUserDataConsistency() {
    await this.userDataConsistencyReportService.createReport()
  }
}
