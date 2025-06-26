import { AlertMessageInputDTO } from '@shared/domain/email/dto/alert-message-input.dto'
import { EmptyEmailInputDTO } from '@shared/domain/email/dto/empty-email-input.dto'
import { UserProvisionedDTO } from '@shared/domain/email/dto/user-provisioned.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { AdminDataConsistencyReportTemplateInput } from '@shared/domain/email/templates/mjml/admin-data-consistency-report.template'
import { NodeCopyTemplateInput } from '@shared/domain/email/templates/mjml/node-copy.template'
import { SpaceInvitationTemplateInput } from '@shared/domain/email/templates/mjml/space-invitation.template'
import { ChallengeOpenedTemplateInput } from '@shared/domain/email/templates/mjml/challenge-opened.template'
import { SpaceChangeTemplateInput } from '@shared/domain/email/templates/mjml/space-change.template'
import { ChallengePreregTemplateInput } from '@shared/domain/email/templates/mjml/challenge-preregister.template'
import { CommentAddedTemplateInput } from '@shared/domain/email/templates/mjml/comment-added.template'
import { ChallengeProposalTemplateInput } from '@shared/domain/email/templates/mjml/challenge-proposed.template'
import { NewContentTemplateInput } from '@shared/domain/email/templates/mjml/new-content.template'
import { ExpertAddedTemplateInput } from '@shared/domain/email/templates/mjml/expert-added.template'
import { ExpertQuestionTemplateInput } from '@shared/domain/email/templates/mjml/expert-question-added.template'
import { InvitationTemplateInput } from '@shared/domain/email/templates/mjml/invitation.template'
import { JobFailedInputTemplate } from '@shared/domain/email/templates/mjml/job-failed.template'
import { JobFinishedInputTemplate } from '@shared/domain/email/templates/mjml/job-finished.template'
import { LicenseApprovalTemplateInput } from '@shared/domain/email/templates/mjml/license-approval-request.template'
import { LicenseRequestApprovedTemplateInput } from '@shared/domain/email/templates/mjml/license-approved.template'
import { LicenseRevokedTemplateInput } from '@shared/domain/email/templates/mjml/license-revoked.template'
import { MemberChangeTemplateInput } from '@shared/domain/email/templates/mjml/member-change.template'
import { SpaceActivatedTemplateInput } from '@shared/domain/email/templates/mjml/space-activated.template'
import { SpaceActivationTemplateInput } from '@shared/domain/email/templates/mjml/space-activation.template'

export type EmailTypeToTemplateInputMap = {
  [EMAIL_TYPES.emailWithoutTemplate]: EmptyEmailInputDTO
  [EMAIL_TYPES.jobFinished]: JobFinishedInputTemplate
  [EMAIL_TYPES.newContentAdded]: NewContentTemplateInput
  [EMAIL_TYPES.memberChangedAddedRemoved]: MemberChangeTemplateInput
  [EMAIL_TYPES.spaceChanged]: SpaceChangeTemplateInput
  [EMAIL_TYPES.commentAdded]: CommentAddedTemplateInput
  [EMAIL_TYPES.challengeOpened]: ChallengeOpenedTemplateInput
  [EMAIL_TYPES.challengePrereg]: ChallengePreregTemplateInput
  [EMAIL_TYPES.jobTerminationWarning]: EmptyEmailInputDTO
  [EMAIL_TYPES.staleJobsReport]: EmptyEmailInputDTO
  [EMAIL_TYPES.nonTerminatedDbClusters]: EmptyEmailInputDTO
  [EMAIL_TYPES.jobFailed]: JobFailedInputTemplate
  [EMAIL_TYPES.adminDataConsistencyReport]: AdminDataConsistencyReportTemplateInput
  [EMAIL_TYPES.userDataConsistencyReport]: EmptyEmailInputDTO
  [EMAIL_TYPES.spaceDiscussion]: EmptyEmailInputDTO
  [EMAIL_TYPES.spaceCreated]: EmptyEmailInputDTO
  [EMAIL_TYPES.userInactivityAlert]: EmptyEmailInputDTO
  [EMAIL_TYPES.alertMessage]: AlertMessageInputDTO
  [EMAIL_TYPES.expertQuestionAdded]: ExpertQuestionTemplateInput
  [EMAIL_TYPES.expertAdded]: ExpertAddedTemplateInput
  [EMAIL_TYPES.challengeProposalReceived]: ChallengeProposalTemplateInput
  [EMAIL_TYPES.licenseApprovalRequest]: LicenseApprovalTemplateInput
  [EMAIL_TYPES.licenseApproved]: LicenseRequestApprovedTemplateInput
  [EMAIL_TYPES.licenseRevoked]: LicenseRevokedTemplateInput
  [EMAIL_TYPES.spaceActivated]: SpaceActivatedTemplateInput
  [EMAIL_TYPES.spaceActivation]: SpaceActivationTemplateInput
  [EMAIL_TYPES.invitation]: InvitationTemplateInput
  [EMAIL_TYPES.spaceInvitation]: SpaceInvitationTemplateInput
  [EMAIL_TYPES.nodeCopy]: NodeCopyTemplateInput
  [EMAIL_TYPES.userProvisioned]: UserProvisionedDTO
}
