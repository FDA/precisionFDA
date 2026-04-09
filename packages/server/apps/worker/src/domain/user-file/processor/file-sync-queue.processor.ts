import { Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { config } from '@shared/config'
import { JobService } from '@shared/domain/job/job.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { getSuccessMessage } from '@shared/domain/user-file/user-file.helper'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { JobWorkstationFacade } from '@shared/facade/job/job-workstation.facade'
import { CopyNodesFacade } from '@shared/facade/node-copy/copy-nodes.facade'
import { LockNodeFacade } from '@shared/facade/node-lock/lock-node.facade'
import { RemoveNodesFacade } from '@shared/facade/node-remove/remove-nodes.facade'
import { UnlockNodeFacade } from '@shared/facade/node-unlock/unlock-node.facade'
import { UserDataConsistencyReportFacade } from '@shared/facade/user/user-data-consistency-report.facade'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { CheckStatusJob, CopyNodesJob, TASK_TYPE, WorkstationSnapshotJob } from '@shared/queue/task.input'
import { TypeUtils } from '@shared/utils/type-utils'
import { ProcessWithContext } from '../../../queues/decorator/process-with-context'

@Processor(config.workerJobs.queues.fileSync.name)
export class FileSyncQueueProcessor {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly userDataConsistencyReportFacade: UserDataConsistencyReportFacade,
    private readonly lockNodeFacade: LockNodeFacade,
    private readonly unlockNodeFacade: UnlockNodeFacade,
    private readonly removeNodesFacade: RemoveNodesFacade,
    private readonly copyNodesFacade: CopyNodesFacade,
    private readonly notificationService: NotificationService,
    private readonly jobServiceWithPlatformClient: JobService,
    private readonly jobWorkstationFacade: JobWorkstationFacade,
  ) {}

  @ProcessWithContext(TASK_TYPE.COPY_NODES)
  async copyNodes(job: Job<CopyNodesJob>): Promise<void> {
    const input = job.data.payload
    await this.copyNodesFacade.copyNodes(input.ids, input.scope, input.folderId)
  }

  @ProcessWithContext(TASK_TYPE.SYNC_JOB_OUTPUTS)
  async syncJobOutputs(job: Job<CheckStatusJob>): Promise<void> {
    await this.jobServiceWithPlatformClient.syncOutputs(job.data.payload.dxid)
  }

  @ProcessWithContext(TASK_TYPE.REMOVE_NODES)
  async removeNodes(job: Job): Promise<void> {
    const ids: number[] = job.data.payload as number[]
    try {
      const { removedFilesCount, removedFoldersCount } = await this.removeNodesFacade.removeNodes(ids, true)
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
          TypeUtils.getPropertyValueFromUnknownObject<string>(error, 'message') ?? 'Error deleting files and folders.',
        severity: SEVERITY.ERROR,
        action: NOTIFICATION_ACTION.NODES_REMOVED,
        userId: this.user.id,
        sessionId: this.user.sessionId,
      })
    }
  }

  @ProcessWithContext(TASK_TYPE.LOCK_NODES)
  async lockNodes(job: Job): Promise<void> {
    const ids: number[] = job.data.payload as number[]
    await this.lockNodeFacade.lockNodes(ids)
  }

  @ProcessWithContext(TASK_TYPE.UNLOCK_NODES)
  async unlockNodes(job: Job): Promise<void> {
    const ids: number[] = job.data.payload as number[]
    await this.unlockNodeFacade.unlockNodes(ids)
  }

  @ProcessWithContext(TASK_TYPE.WORKSTATION_SNAPSHOT)
  async createWorkstationSnapshot(job: Job<WorkstationSnapshotJob>): Promise<void> {
    await this.jobWorkstationFacade.snapshot(
      job.data.payload.jobUid,
      job.data.payload.code,
      job.data.payload.key,
      job.data.payload.name,
      job.data.payload.terminate,
    )
  }

  @ProcessWithContext(TASK_TYPE.USER_DATA_CONSISTENCY_REPORT)
  async reportUserDataConsistency(): Promise<void> {
    const result = await this.userDataConsistencyReportFacade.createReport()
    await this.userDataConsistencyReportFacade.fixInconsistentData(result.inconsistentFixes)
  }
}
