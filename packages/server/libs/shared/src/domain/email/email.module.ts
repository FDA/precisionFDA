import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { App } from '@shared/domain/app/app.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { EmailService } from '@shared/domain/email/email.service'
import { emailClientProvider } from '@shared/domain/email/email-client.provider'
import { EmailSendService } from '@shared/domain/email/email-send.service'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { AlertMessageHandler } from '@shared/domain/email/templates/handlers/alert-message.handler'
import { ChallengeOpenedEmailHandler } from '@shared/domain/email/templates/handlers/challenge-opened.handler'
import { ChallengePreregEmailHandler } from '@shared/domain/email/templates/handlers/challenge-prereg.handler'
import { ChallengeProposalReceivedHandler } from '@shared/domain/email/templates/handlers/challenge-proposal-received.handler'
import { CommentAddedEmailHandler } from '@shared/domain/email/templates/handlers/comment-added.handler'
import { ContentChangedEmailHandler } from '@shared/domain/email/templates/handlers/content-change.handler'
import { ExpertAddedHandler } from '@shared/domain/email/templates/handlers/expert-added.handler'
import { ExpertQuestionAddedHandler } from '@shared/domain/email/templates/handlers/expert-question-added.handler'
import { InvitationHandler } from '@shared/domain/email/templates/handlers/invitation.handler'
import { JobFailedEmailHandler } from '@shared/domain/email/templates/handlers/job-failed.handler'
import { JobFinishedEmailHandler } from '@shared/domain/email/templates/handlers/job-finished.handler'
import { LicenseApprovalRequestHandler } from '@shared/domain/email/templates/handlers/license-approval-request.handler'
import { LicenseApprovedHandler } from '@shared/domain/email/templates/handlers/license-approved.handler'
import { LicenseRevokedHandler } from '@shared/domain/email/templates/handlers/license-revoked.handler'
import { MemberChangedEmailHandler } from '@shared/domain/email/templates/handlers/member-change.handler'
import { NewDiscussionHandler } from '@shared/domain/email/templates/handlers/new-discussion.handler'
import { NewDiscussionReplyHandler } from '@shared/domain/email/templates/handlers/new-discussion-reply.handler'
import { NodeCopyHandler } from '@shared/domain/email/templates/handlers/node-copy.handler'
import { SpaceActivatedHandler } from '@shared/domain/email/templates/handlers/space-activated.handler'
import { SpaceActivationEmailHandler } from '@shared/domain/email/templates/handlers/space-activation.handler'
import { SpaceChangedEmailHandler } from '@shared/domain/email/templates/handlers/space-change.handler'
import { SpaceInvitationHandler } from '@shared/domain/email/templates/handlers/space-invitation.handler'
import { UserProvisionedHandler } from '@shared/domain/email/templates/handlers/user-provisioned.handler'
import { TypeToHandlerMapProvider } from '@shared/domain/email/type-to-handler-map.provider'
import { EntityModule } from '@shared/domain/entity/entity.module'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { Job } from '@shared/domain/job/job.entity'
import { License } from '@shared/domain/license/license.entity'
import { Space } from '@shared/domain/space/space.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { BullQueueModule } from '@shared/queue/module/bull-queue-module'
import { AccessRequestConfirmationHandler } from './templates/handlers/access-request-confirmation.handler'
import { StaleJobsReportHandler } from './templates/handlers/stale-jobs-report.handler'
import { UserRunningJobsReportHandler } from './templates/handlers/user-running-jobs-report.handler'

@Module({
  imports: [
    BullQueueModule.registerQueue({
      name: config.workerJobs.queues.emails.name,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3, // Re-try sending the email a few times in case of network issue
        backoff: 5 * 60 * 1000, // 5 min delay between retries
        priority: 5,
      },
    }),
    MikroOrmModule.forFeature([
      AcceptedLicense,
      App,
      Challenge,
      Comment,
      Discussion,
      Expert,
      ExpertQuestion,
      Invitation,
      Job,
      License,
      Space,
      SpaceEvent,
      SpaceMembership,
      User,
      UserFile,
    ]),
    EntityModule,
  ],
  providers: [
    EmailQueueJobProducer,
    EmailSendService,
    EmailService,
    emailClientProvider,
    AlertMessageHandler,
    UserProvisionedHandler,
    SpaceInvitationHandler,
    ChallengeOpenedEmailHandler,
    ChallengePreregEmailHandler,
    CommentAddedEmailHandler,
    NodeCopyHandler,
    ChallengeProposalReceivedHandler,
    ContentChangedEmailHandler,
    ExpertAddedHandler,
    ExpertQuestionAddedHandler,
    InvitationHandler,
    JobFailedEmailHandler,
    JobFinishedEmailHandler,
    LicenseApprovalRequestHandler,
    LicenseApprovedHandler,
    LicenseRevokedHandler,
    MemberChangedEmailHandler,
    SpaceActivatedHandler,
    SpaceActivationEmailHandler,
    SpaceChangedEmailHandler,
    NewDiscussionHandler,
    NewDiscussionReplyHandler,
    TypeToHandlerMapProvider,
    AccessRequestConfirmationHandler,
    StaleJobsReportHandler,
    UserRunningJobsReportHandler,
  ],
  exports: [BullQueueModule, EmailQueueJobProducer, EmailSendService, EmailService, emailClientProvider],
})
export class EmailModule {}
