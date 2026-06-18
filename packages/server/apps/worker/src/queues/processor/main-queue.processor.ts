import { Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { DbClusterSynchronizeFacade } from 'apps/api/src/facade/db-cluster/synchronize-facade/db-cluster-synchronize.facade'
import { Job } from 'bull'
import { config } from '@shared/config'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { EmailService } from '@shared/domain/email/email.service'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { JobService } from '@shared/domain/job/job.service'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeService } from '@shared/domain/user-file/node.service'
import { FOLLOW_UP_ACTION } from '@shared/domain/user-file/user-file.input'
import { ClientRequestError } from '@shared/errors'
import { SpaceMemberNotificationFacade } from '@shared/facade/space-member-notification/space-member-notification.facade'
import { SyncFilesStateFacade } from '@shared/facade/sync-file-state/sync-files-state.facade'
import { UserProvisionFacade } from '@shared/facade/user/user-provision.facade'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { createRunFollowUpActionJobTask, removeRepeatable } from '@shared/queue'
import {
  NotifyNewDiscussionJob,
  ProvisionNewUserJob,
  TASK_TYPE,
  UiNotifyNewDiscussionReplyJob,
} from '@shared/queue/task.input'
import { FollowUpDecider } from '../../domain/user-file/follow-up-decider'
import { OnQueueFailedWithContext } from '../decorator/on-queue-failed-with-context'
import { ProcessWithContext } from '../decorator/process-with-context'

@Processor(config.workerJobs.queues.default.name)
export class MainQueueProcessor {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly user: UserContext,
    private readonly nodeService: NodeService,
    private readonly challengeService: ChallengeService,
    private readonly dataPortalService: DataPortalService,
    private readonly followUpDecider: FollowUpDecider,
    private readonly spaceReportService: SpaceReportService,
    private readonly syncFilesStateFacade: SyncFilesStateFacade,
    private readonly dbClusterSynchronizeFacade: DbClusterSynchronizeFacade,
    private readonly emailService: EmailService,
    private readonly jobService: JobService,
    private readonly userProvisionFacade: UserProvisionFacade,
    private readonly spaceMemberNotificationFacade: SpaceMemberNotificationFacade,
  ) {}

  @ProcessWithContext(TASK_TYPE.SYNC_FILES_STATE)
  async syncFilesState(job: Job): Promise<void> {
    await this.syncFilesStateFacade.syncFiles(job)
  }

  @ProcessWithContext(TASK_TYPE.SYNC_JOB_STATUS)
  async syncJobStatus(job: Job): Promise<void> {
    await this.jobService.synchronizeJob(job.data.payload.dxid, job)
  }

  @ProcessWithContext(TASK_TYPE.SYNC_DBCLUSTER_STATUS)
  async syncDbClusterStatus(job: Job): Promise<void> {
    await this.dbClusterSynchronizeFacade.syncDbClusterStatus(job)
  }

  @ProcessWithContext(TASK_TYPE.SYNC_DBCLUSTER_JOB_OUTPUT)
  async syncDbClusterJobOutput(job: Job): Promise<void> {
    await this.dbClusterSynchronizeFacade.syncDbClusterJobOutput(job)
  }

  @ProcessWithContext(TASK_TYPE.SYNC_FILE_STATE)
  async syncFileState(job: Job): Promise<void> {
    const input = job.data.payload
    this.logger.log(`synchronizing file ${input.fileUid}`)
    const result = await this.nodeService.synchronizeFile(input.fileUid, input.isChallengeBotFile)
    this.logger.log(`synchronizeFile result: ${result}`)

    if (!result) {
      this.logger.log(
        `File ${input.fileUid} is not ready yet. Deferring via Bull retry/backoff (${job.attemptsMade + 1}/${job.opts.attempts ?? 'n/a'}).`,
      )

      await job.moveToFailed(new Error(`File ${input.fileUid} is not ready on platform to be synchronized`), true)
      return
    } else {
      const followUpAction = await this.followUpDecider.decideNextAction(input.fileUid)
      if (followUpAction) {
        this.logger.log(`creating follow up action`, input)
        await createRunFollowUpActionJobTask(
          {
            uid: input.fileUid,
            followUpAction: followUpAction,
          },
          this.user,
        )
      }
    }
  }

  @ProcessWithContext(TASK_TYPE.CLOSE_FILE)
  async closeFile(job: Job): Promise<void> {
    const payload = job.data.payload
    await this.nodeService.closeFile(payload.fileUid, payload.followUpAction)
  }

  @ProcessWithContext(TASK_TYPE.FOLLOW_UP_ACTION)
  async followUpAction(job: Job): Promise<void> {
    const input = job.data.payload
    const actionsMap: Record<FOLLOW_UP_ACTION, () => Promise<void>> = {
      UPDATE_DATA_PORTAL_IMAGE_URL: () => this.dataPortalService.updateCardImageUrl(input.uid),
      UPDATE_CHALLENGE_IMAGE_URL: () => this.challengeService.updateCardImageUrl(input.uid),
      UPDATE_CHALLENGE_RESOURCE_URL: () => this.challengeService.updateResourceUrl(input.uid),
      COMPLETE_SPACE_REPORT: () => this.spaceReportService.completeReportForResultFile(input.uid),
    }

    const method = actionsMap[input.followUpAction.toString()]
    await method()
  }

  @ProcessWithContext(TASK_TYPE.NOTIFY_NEW_DISCUSSION)
  async notifyNewDiscussion(job: Job<NotifyNewDiscussionJob>): Promise<void> {
    const { discussionId, notify } = job.data.payload
    // TODO for some reason, the type of notify is any here. Ask Ludvik

    await this.emailService.sendEmail({
      type: EMAIL_TYPES.newDiscussion,
      input: {
        discussionId,
        notify,
      },
      receiverUserIds: [],
    })
  }

  @ProcessWithContext(TASK_TYPE.NOTIFY_NEW_DISCUSSION_REPLY)
  async notifyNewDiscussionReply(job: Job<NotifyNewDiscussionJob>): Promise<void> {
    const { discussionId, notify } = job.data.payload
    // TODO for some reason, the type of notify is any here. Ask Ludvik

    await this.emailService.sendEmail({
      type: EMAIL_TYPES.newDiscussionReply,
      input: {
        discussionId,
        notify,
      },
      receiverUserIds: [],
    })
  }

  @ProcessWithContext(TASK_TYPE.UI_NOTIFY_NEW_DISCUSSION_REPLY)
  async notifyNewDiscussionReplyOnUI(job: Job<UiNotifyNewDiscussionReplyJob>): Promise<void> {
    const { spaceId, type, replyUrl } = job.data.payload
    await this.spaceMemberNotificationFacade.notifyNewDiscussionReply(spaceId, type, replyUrl)
  }

  @ProcessWithContext(TASK_TYPE.PROVISION_NEW_USERS)
  async provisionNewUser(job: Job<ProvisionNewUserJob>): Promise<void> {
    const { ids, spaceIds } = job.data.payload
    for (const id of ids) {
      this.logger.log(`Provisioning new user with invitationId ${id}`)
      await this.userProvisionFacade.provision(id, spaceIds, ids)
    }
  }

  /**
   * Event listener for failed jobs. This is not part of the main processing pipeline.
   *
   * Case-specific handling:
   * - 401 errors from the platform: Remove the job, as it cannot be retried successfully.
   * - Remove job if other errors occur in a repeatable job to prevent job attempts, as the new job will be created on the next schedule.
   *
   * All other errors are just logged. Job retries and backoff are managed by the queue configuration.
   */
  @OnQueueFailedWithContext()
  async onQueueFailed(job: Job, error: Error): Promise<void> {
    const isJobRepeat = !!job.opts.repeat
    if (error instanceof ClientRequestError && error.props?.clientStatusCode === 401) {
      // Unauthorized. Expected scenario is that the user token has expired
      // Removing the sync task will allow a new sync task to be recreated
      // when user next logs in via UserCheckupTask
      this.logger.log(`Received 401 from platform for job ${job.data?.type} (${job.id}), removing sync task`)
      if (isJobRepeat) {
        await removeRepeatable(job)
      } else {
        this.logger.warn(`Non-repeatable job ${job.data?.type} (${job.id}) failed with 401 from platform, removing job`)
      }
      return
    }

    if (isJobRepeat) {
      this.logger.warn(`Repeatable job ${job.data?.type} (${job.id}) failed, discarding retries`)
      await job.remove()
      return
    }

    this.logger.error(`Job ${job.data?.type} (${job.id}) failed with error: ${error.message}`)
  }
}
