import { Injectable, Logger } from '@nestjs/common'
import { AuthService } from '@shared/domain/auth/services/auth.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { JobSnapshotBodyDTO } from '@shared/domain/job/dto/job-snapshot-body.dto'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { JobService } from '@shared/domain/job/job.service'
import { WorkstationAPIResponse } from '@shared/domain/job/services/workstation-client/workstation-client'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { FileSyncQueueJobProducer } from '@shared/domain/user-file/producer/file-sync-queue-job.producer'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { InvalidStateError, NotFoundError, WorkstationAPIError } from '@shared/errors'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { PlatformClient } from '@shared/platform-client'
import { TimeUtils } from '@shared/utils/time.utils'

@Injectable()
export class JobWorkstationFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly jobService: JobService,
    private readonly notificationService: NotificationService,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
    private readonly platformClient: PlatformClient,
    private readonly authService: AuthService,
  ) {}

  async openExternal(jobUid: Uid<'job'>): Promise<string> {
    const job = await this.jobService.getAccessibleEntityByUid(jobUid)
    if (!job) {
      throw new NotFoundError(`Job ${jobUid} not found`)
    }

    if (job.state !== JOB_STATE.RUNNING || !job.isHttpsAppRunning()) {
      throw new InvalidStateError(`Job ${jobUid} is not an active HTTPS workstation`)
    }

    const httpsJobExternalUrl = job.getHttpsAppUrl()
    if (!httpsJobExternalUrl) {
      throw new InvalidStateError(`Cannot obtain HTTPS URL for job ${jobUid}`)
    }

    const [refreshCode, key] = await Promise.all([
      this.platformClient.systemNewAuthToken(httpsJobExternalUrl),
      this.authService.generateCliKey(TimeUtils.daysToSeconds(1)),
    ])
    // Configure the workstation in the background so the redirect can continue.
    void this.jobService.setAPIKey(jobUid, { code: refreshCode, key }).catch((err: unknown) => {
      this.logger.error(`Failed to set API key for job ${jobUid}`, err)
    })

    // Get auth token for the redirect
    const authCode = await this.platformClient.systemNewAuthToken(httpsJobExternalUrl)
    return `${httpsJobExternalUrl}/oauth2/access?code=${authCode}`
  }

  async createWorkstationSnapshotTask(jobUid: Uid<'job'>, data: JobSnapshotBodyDTO): Promise<void> {
    const job = await this.jobService.getAccessibleEntityByUid(jobUid)
    if (!job) {
      throw new NotFoundError(`Job ${jobUid} not found`)
    }

    if (job.state !== JOB_STATE.RUNNING || !job.isHttpsAppRunning()) {
      throw new InvalidStateError(`Job ${jobUid} is not an active HTTPS workstation`)
    }

    const httpsJobExternalUrl = job.getHttpsAppUrl()
    if (!httpsJobExternalUrl) {
      throw new InvalidStateError(`Cannot obtain HTTPS URL for job ${jobUid}`)
    }

    await this.fileSyncQueueJobProducer.createWorkstationSnapshotTask({
      jobUid,
      httpsJobExternalUrl,
      ...data,
    })
  }

  async snapshot(
    jobUid: Uid<'job'>,
    httpsJobExternalUrl: string,
    name: string,
    terminate: boolean,
    preScript?: string,
  ): Promise<WorkstationAPIResponse> {
    this.logger.log('Starting workstation snapshot operation', { jobUid, name, terminate })

    try {
      const [code, key] = await Promise.all([
        this.platformClient.systemNewAuthToken(httpsJobExternalUrl),
        this.authService.generateCliKey(TimeUtils.daysToSeconds(1)),
      ])

      const res = await this.jobService.createWorkstationSnapshot(jobUid, code, key, name, terminate, preScript)
      this.logger.log({ res }, 'Received snapshot response')

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
      return res
    } catch (err: unknown) {
      const error = err as WorkstationAPIError
      const message = `Error creating snapshot for ${name}: ${error.message}`
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
      throw error
    }
  }
}
