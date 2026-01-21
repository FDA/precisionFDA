import { EmptyEmailInputDTO } from '@shared/domain/email/dto/empty-email-input.dto'
import { AlertMessageInputDTO } from '@shared/domain/email/dto/alert-message-input.dto'
import { LicenseApprovalRequestDTO } from '@shared/domain/email/dto/license-approval-request.dto'
import { NodeCopyInputDTO } from '@shared/domain/email/dto/node-copy-input.dto'
import { InvitationToSpaceDTO } from '@shared/domain/email/dto/invitation-to-space.dto'
import { JobEventDTO } from '@shared/domain/email/dto/job-event.dto'
import { ChallengeProposalInputDTO } from '@shared/domain/email/dto/challenge-proposal.dto'
import { MemberChangedDTO } from '@shared/domain/email/dto/member-changed.dto'
import { ChallengeOpenedDTO } from '@shared/domain/email/dto/challenge-opened.dto'
import { SpaceChangedDTO } from '@shared/domain/email/dto/space-changed.dto'
import { ChallengeCreatedDTO } from '@shared/domain/email/dto/challenge-created.dto'
import { UserProvisionedDTO } from '@shared/domain/email/dto/user-provisioned.dto'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { IdWithReceiversInputDTO } from '@shared/domain/email/dto/id-with-receivers-input.dto'
import { ObjectIdInputDTO } from '@shared/domain/email/dto/object-id.dto'
import { DiscussionNotificationDTO } from '@shared/domain/email/dto/discussion-notification.dto'
import { AdminStaleJobsReportDTO } from '@shared/domain/job/dto/admin-stale-job-report-input.dto'
import { UserRunningJobsReportDTO } from '@shared/domain/job/dto/user-running-job-report-input.dto'

export const emailTypeToInputDtoMap = {
  [EMAIL_TYPES.emailWithoutTemplate]: EmptyEmailInputDTO,
  [EMAIL_TYPES.jobFinished]: JobEventDTO,
  [EMAIL_TYPES.newContentAdded]: ObjectIdInputDTO,
  [EMAIL_TYPES.memberChangedAddedRemoved]: MemberChangedDTO,
  [EMAIL_TYPES.spaceChanged]: SpaceChangedDTO,
  [EMAIL_TYPES.commentAdded]: ObjectIdInputDTO,
  [EMAIL_TYPES.challengeOpened]: ChallengeOpenedDTO,
  [EMAIL_TYPES.challengePrereg]: ChallengeCreatedDTO,
  [EMAIL_TYPES.jobTerminationWarning]: EmptyEmailInputDTO,
  [EMAIL_TYPES.staleJobsReport]: AdminStaleJobsReportDTO,
  [EMAIL_TYPES.nonTerminatedDbClusters]: EmptyEmailInputDTO,
  [EMAIL_TYPES.jobFailed]: JobEventDTO,
  [EMAIL_TYPES.adminDataConsistencyReport]: EmptyEmailInputDTO,
  [EMAIL_TYPES.userDataConsistencyReport]: EmptyEmailInputDTO,
  [EMAIL_TYPES.spaceDiscussion]: EmptyEmailInputDTO,
  [EMAIL_TYPES.spaceCreated]: EmptyEmailInputDTO,
  [EMAIL_TYPES.userInactivityAlert]: EmptyEmailInputDTO,
  [EMAIL_TYPES.alertMessage]: AlertMessageInputDTO,
  [EMAIL_TYPES.expertQuestionAdded]: ObjectIdInputDTO,
  [EMAIL_TYPES.expertAdded]: ObjectIdInputDTO,
  [EMAIL_TYPES.challengeProposalReceived]: ChallengeProposalInputDTO,
  [EMAIL_TYPES.licenseApprovalRequest]: LicenseApprovalRequestDTO,
  [EMAIL_TYPES.licenseApproved]: IdWithReceiversInputDTO,
  [EMAIL_TYPES.licenseRevoked]: IdWithReceiversInputDTO,
  [EMAIL_TYPES.spaceActivated]: ObjectIdInputDTO,
  [EMAIL_TYPES.spaceActivation]: ObjectIdInputDTO,
  [EMAIL_TYPES.invitation]: ObjectIdInputDTO,
  [EMAIL_TYPES.spaceInvitation]: InvitationToSpaceDTO,
  [EMAIL_TYPES.nodeCopy]: NodeCopyInputDTO,
  [EMAIL_TYPES.userProvisioned]: UserProvisionedDTO,
  [EMAIL_TYPES.newDiscussion]: DiscussionNotificationDTO,
  [EMAIL_TYPES.newDiscussionReply]: DiscussionNotificationDTO,
  [EMAIL_TYPES.userRunningJobsReport]: UserRunningJobsReportDTO,
} satisfies Record<EMAIL_TYPES, new () => object>

export type EmailTypeToInputMap = {
  [K in keyof typeof emailTypeToInputDtoMap]: InstanceType<(typeof emailTypeToInputDtoMap)[K]>
}
