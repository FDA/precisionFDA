import { Injectable, Logger } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobSnapshotBodyDTO } from '@shared/domain/job/dto/job-snapshot-body.dto'
import { JobService } from '@shared/domain/job/job.service'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { ErrorCodes } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { WorkstationAPIResponse } from '@shared/workstation-client/workstation-client'

@Injectable()
export class JobWorkstationFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly jobService: JobService,
    private readonly notificationService: NotificationService,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
  ) {}

  async createWorkstationSnapshotTask(jobUid: Uid<'job'>, data: JobSnapshotBodyDTO): Promise<void> {
    await this.fileSyncQueueJobProducer.createWorkstationSnapshotTask({
      jobUid,
      ...data,
    })
  }

  async snapshot(
    jobUid: Uid<'job'>,
    code: string,
    key: string,
    name: string,
    terminate: boolean,
  ): Promise<WorkstationAPIResponse> {
    this.logger.log('Starting workstation snapshot operation', { jobUid, name, terminate })

    try {
      const res = await this.jobService.createWorkstationSnapshot(jobUid, code, key, name, terminate)
      this.logger.log({ res }, 'Received snapshot response')

      if (res.result === 'success') {
        const message = terminate
          ? `Snapshot created for ${name}. The workstation will now terminate`
          : `Snapshot created for ${name}`
        await this.notificationService.createNotification({
          message,
          meta: {
            linkTitle: 'View Execution',
            linkUrl: `/home/executions/${jobUid}`,
          },
          severity: SEVERITY.INFO,
          action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_COMPLETED,
          userId: this.user.id,
          sessionId: this.user.sessionId,
        })
      } else {
        await this.notificationService.createNotification({
          message: `Error creating snapshot for ${name}: ${res.error}`,
          meta: {
            linkTitle: 'View Execution',
            linkUrl: `/home/executions/${jobUid}`,
          },
          severity: SEVERITY.ERROR,
          action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
          userId: this.user.id,
          sessionId: this.user.sessionId,
        })
      }
      return res
    } catch (err) {
      const message = `Error creating snapshot for ${name}: ${err.message}`
      await this.notificationService.createNotification({
        message,
        meta: {
          linkTitle: 'View Execution',
          linkUrl: `/home/executions/${jobUid}`,
        },
        severity: SEVERITY.ERROR,
        action: NOTIFICATION_ACTION.WORKSTATION_SNAPSHOT_ERROR,
        userId: this.user.id,
        sessionId: this.user.sessionId,
      })
      return {
        error: {
          code: ErrorCodes.WORKSTATION_API_ERROR,
          message,
        },
      }
    }
  }
}
