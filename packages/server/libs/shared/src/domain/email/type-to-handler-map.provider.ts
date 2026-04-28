import { Provider } from '@nestjs/common'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
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
import { AccessRequestConfirmationHandler } from './templates/handlers/access-request-confirmation.handler'
import { StaleJobsReportHandler } from './templates/handlers/stale-jobs-report.handler'
import { UserRunningJobsReportHandler } from './templates/handlers/user-running-jobs-report.handler'

const TYPE_TO_HANDLER_PROVIDER_MAP = 'TYPE_TO_HANDLER_PROVIDER_MAP'

type TypeToHandlerMap = {
  [EMAIL_TYPES.alertMessage]: AlertMessageHandler
  [EMAIL_TYPES.userProvisioned]: UserProvisionedHandler
  [EMAIL_TYPES.nodeCopy]: NodeCopyHandler
  [EMAIL_TYPES.spaceInvitation]: SpaceInvitationHandler
  [EMAIL_TYPES.challengePrereg]: ChallengePreregEmailHandler
  [EMAIL_TYPES.challengeOpened]: ChallengeOpenedEmailHandler
  [EMAIL_TYPES.challengeProposalReceived]: ChallengeProposalReceivedHandler
  [EMAIL_TYPES.commentAdded]: CommentAddedEmailHandler
  [EMAIL_TYPES.jobFinished]: JobFinishedEmailHandler
  [EMAIL_TYPES.newContentAdded]: ContentChangedEmailHandler
  [EMAIL_TYPES.expertAdded]: ExpertAddedHandler
  [EMAIL_TYPES.expertQuestionAdded]: ExpertQuestionAddedHandler
  [EMAIL_TYPES.invitation]: InvitationHandler
  [EMAIL_TYPES.jobFailed]: JobFailedEmailHandler
  [EMAIL_TYPES.licenseApprovalRequest]: LicenseApprovalRequestHandler
  [EMAIL_TYPES.licenseApproved]: LicenseApprovedHandler
  [EMAIL_TYPES.licenseRevoked]: LicenseRevokedHandler
  [EMAIL_TYPES.memberChangedAddedRemoved]: MemberChangedEmailHandler
  [EMAIL_TYPES.spaceActivated]: SpaceActivatedHandler
  [EMAIL_TYPES.spaceActivation]: SpaceActivationEmailHandler
  [EMAIL_TYPES.spaceChanged]: SpaceChangedEmailHandler
  [EMAIL_TYPES.newDiscussion]: NewDiscussionHandler
  [EMAIL_TYPES.newDiscussionReply]: NewDiscussionReplyHandler
  [EMAIL_TYPES.staleJobsReport]: StaleJobsReportHandler
  [EMAIL_TYPES.userRunningJobsReport]: UserRunningJobsReportHandler
  [EMAIL_TYPES.accessRequestConfirmation]: AccessRequestConfirmationHandler
}

const TypeToHandlerMapProvider: Provider = {
  provide: TYPE_TO_HANDLER_PROVIDER_MAP,
  inject: [
    AlertMessageHandler,
    UserProvisionedHandler,
    NodeCopyHandler,
    SpaceInvitationHandler,
    ChallengePreregEmailHandler,
    ChallengeOpenedEmailHandler,
    ChallengeProposalReceivedHandler,
    CommentAddedEmailHandler,
    JobFinishedEmailHandler,
    ContentChangedEmailHandler,
    ExpertAddedHandler,
    ExpertQuestionAddedHandler,
    InvitationHandler,
    JobFailedEmailHandler,
    LicenseApprovalRequestHandler,
    LicenseApprovedHandler,
    LicenseRevokedHandler,
    MemberChangedEmailHandler,
    SpaceActivatedHandler,
    SpaceActivationEmailHandler,
    SpaceChangedEmailHandler,
    NewDiscussionHandler,
    NewDiscussionReplyHandler,
    StaleJobsReportHandler,
    UserRunningJobsReportHandler,
    AccessRequestConfirmationHandler,
  ],
  useFactory: (
    alertMessageHandler: AlertMessageHandler,
    userProvisionedHandler: UserProvisionedHandler,
    nodeCopyHandler: NodeCopyHandler,
    spaceInvitationHandler: SpaceInvitationHandler,
    challengePreregEmailHandler: ChallengePreregEmailHandler,
    challengeOpenedEmailHandler: ChallengeOpenedEmailHandler,
    challengeProposalReceivedHandler: ChallengeProposalReceivedHandler,
    commentAddedEmailHandler: CommentAddedEmailHandler,
    jobFinishedEmailHandler: JobFinishedEmailHandler,
    contentChangedEmailHandler: ContentChangedEmailHandler,
    expertAddedHandler: ExpertAddedHandler,
    expertQuestionAddedHandler: ExpertQuestionAddedHandler,
    invitation: InvitationHandler,
    jobFailedEmailHandler: JobFailedEmailHandler,
    licenseApprovalRequestHandler: LicenseApprovalRequestHandler,
    licenseApprovedHandler: LicenseApprovedHandler,
    licenseRevokedHandler: LicenseRevokedHandler,
    memberChangedEmailHandler: MemberChangedEmailHandler,
    spaceActivatedHandler: SpaceActivatedHandler,
    spaceActivationHandler: SpaceActivationEmailHandler,
    spaceChangedEmailHandler: SpaceChangedEmailHandler,
    newDicussionHandler: NewDiscussionHandler,
    newDicussionReplyHandler: NewDiscussionReplyHandler,
    staleJobsReportHandler: StaleJobsReportHandler,
    userRunningJobsReportHandler: UserRunningJobsReportHandler,
    accessRequestConfirmationHandler: AccessRequestConfirmationHandler,
  ): TypeToHandlerMap => {
    return {
      [EMAIL_TYPES.alertMessage]: alertMessageHandler,
      [EMAIL_TYPES.userProvisioned]: userProvisionedHandler,
      [EMAIL_TYPES.nodeCopy]: nodeCopyHandler,
      [EMAIL_TYPES.spaceInvitation]: spaceInvitationHandler,
      [EMAIL_TYPES.challengePrereg]: challengePreregEmailHandler,
      [EMAIL_TYPES.challengeOpened]: challengeOpenedEmailHandler,
      [EMAIL_TYPES.challengeProposalReceived]: challengeProposalReceivedHandler,
      [EMAIL_TYPES.commentAdded]: commentAddedEmailHandler,
      [EMAIL_TYPES.jobFinished]: jobFinishedEmailHandler,
      [EMAIL_TYPES.newContentAdded]: contentChangedEmailHandler,
      [EMAIL_TYPES.expertAdded]: expertAddedHandler,
      [EMAIL_TYPES.expertQuestionAdded]: expertQuestionAddedHandler,
      [EMAIL_TYPES.invitation]: invitation,
      [EMAIL_TYPES.jobFailed]: jobFailedEmailHandler,
      [EMAIL_TYPES.licenseApprovalRequest]: licenseApprovalRequestHandler,
      [EMAIL_TYPES.licenseApproved]: licenseApprovedHandler,
      [EMAIL_TYPES.licenseRevoked]: licenseRevokedHandler,
      [EMAIL_TYPES.memberChangedAddedRemoved]: memberChangedEmailHandler,
      [EMAIL_TYPES.spaceActivated]: spaceActivatedHandler,
      [EMAIL_TYPES.spaceActivation]: spaceActivationHandler,
      [EMAIL_TYPES.spaceChanged]: spaceChangedEmailHandler,
      [EMAIL_TYPES.newDiscussion]: newDicussionHandler,
      [EMAIL_TYPES.newDiscussionReply]: newDicussionReplyHandler,
      [EMAIL_TYPES.staleJobsReport]: staleJobsReportHandler,
      [EMAIL_TYPES.userRunningJobsReport]: userRunningJobsReportHandler,
      [EMAIL_TYPES.accessRequestConfirmation]: accessRequestConfirmationHandler,
    }
  },
}

export { TYPE_TO_HANDLER_PROVIDER_MAP, TypeToHandlerMapProvider }
