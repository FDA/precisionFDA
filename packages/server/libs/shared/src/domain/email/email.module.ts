import { Module } from '@nestjs/common'
import { config } from '@shared/config'
import { EmailQueueJobProducer } from '@shared/domain/email/producer/email-queue-job.producer'
import { BullQueueModule } from '@shared/queue/module/bull-queue-module'
import { EmailSendService } from '@shared/domain/email/email-send.service'
import { EmailService } from '@shared/domain/email/email.service'
import { emailClientProvider } from '@shared/domain/email/email-client.provider'
import { AlertMessageHandler } from '@shared/domain/email/templates/handlers/alert-message.handler'
import { TypeToHandlerMapProvider } from '@shared/domain/email/type-to-handler-map.provider'
import { UserProvisionedHandler } from '@shared/domain/email/templates/handlers/user-provisioned.handler'
import { NodeCopyHandler } from '@shared/domain/email/templates/handlers/node-copy.handler'
import { SpaceInvitationHandler } from '@shared/domain/email/templates/handlers/space-invitation.handler'
import { ChallengeOpenedEmailHandler } from '@shared/domain/email/templates/handlers/challenge-opened.handler'
import { ChallengePreregEmailHandler } from '@shared/domain/email/templates/handlers/challenge-prereg.handler'
import { CommentAddedEmailHandler } from '@shared/domain/email/templates/handlers/comment-added.handler'
import { ChallengeProposalReceivedHandler } from '@shared/domain/email/templates/handlers/challenge-proposal-received.handler'
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
import { SpaceActivatedHandler } from '@shared/domain/email/templates/handlers/space-activated.handler'
import { SpaceActivationEmailHandler } from '@shared/domain/email/templates/handlers/space-activation.handler'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { User } from '@shared/domain/user/user.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { Space } from '@shared/domain/space/space.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { App } from '@shared/domain/app/app.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Expert } from '@shared/domain/expert/expert.entity'
import { ExpertQuestion } from '@shared/domain/expert-question/expert-question.entity'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { License } from '@shared/domain/license/license.entity'
import { SpaceChangedEmailHandler } from '@shared/domain/email/templates/handlers/space-change.handler'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'

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
    TypeToHandlerMapProvider,
  ],
  exports: [
    BullQueueModule,
    EmailQueueJobProducer,
    EmailSendService,
    EmailService,
    emailClientProvider,
  ],
})
export class EmailModule {}
