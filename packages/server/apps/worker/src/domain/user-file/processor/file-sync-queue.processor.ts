import { Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { config } from '@shared/config'
import { JobService } from '@shared/domain/job/job.service'
import { WorkstationSnapshotOperation } from '@shared/domain/job/ops/workstation-snapshot'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { getSuccessMessage } from '@shared/domain/user-file/user-file.helper'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { CheckStatusJob, TASK_TYPE } from '@shared/queue/task.input'
import { TypeUtils } from '@shared/utils/type-utils'
import { Job } from 'bull'
import { lockNodesHandler } from '../../../jobs/lock-nodes.handler'
import { unlockNodesHandler } from '../../../jobs/unlock-nodes.handler'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'
import { BaseQueueProcessor } from '../../../queues/processor/base-queue.processor'

@Processor(config.workerJobs.queues.fileSync.name)
export class FileSyncQueueProcessor extends BaseQueueProcessor {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly userDataConsistencyReportFacade: UserDataConsistencyReportFacade,
    private readonly removeNodesFacade: RemoveNodesFacade,
    private readonly notificationService: NotificationService,
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
    try {
      const { removedFilesCount, removedFoldersCount } = await this.removeNodesFacade.removeNodes(
        ids,
        true,
      )
      await this.notificationService.createNotification({
        message: getSuccessMessage(removedFilesCount, removedFoldersCount, 'Successfully deleted'),
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.NODES_REMOVED,
        userId: this.user.id,
        sessionId: this.user.sessionId,
      })
    } catch (error) {
      this.logger.error(error)
      await this.notificationService.createNotification({
        message:
          TypeUtils.getPropertyValueFromUnknownObject<string>(error, 'message') ??
          'Error deleting files and folders.',
        severity: SEVERITY.ERROR,
        action: NOTIFICATION_ACTION.NODES_REMOVED,
        userId: this.user.id,
        sessionId: this.user.sessionId,
      })
    }
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
    const result = await this.userDataConsistencyReportFacade.createReport()
    await this.userDataConsistencyReportFacade.fixInconsistentData(result.inconsistentFixes)
  }
}
