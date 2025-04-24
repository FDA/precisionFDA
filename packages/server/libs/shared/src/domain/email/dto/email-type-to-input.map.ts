import { EmptyEmailInputDTO } from '@shared/domain/email/dto/empty-email-input.dto'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { ObjectIdInputDTO } from '@shared/domain/email/email.helper'
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
import { UserProvisionedDto } from '@shared/domain/email/dto/user-provisioned.dto'

export const emailTypeToInputDtoMap = {
  [EMAIL_TYPES.emailWithoutTemplate]: EmptyEmailInputDTO, // emailWithoutTemplate
  [EMAIL_TYPES.jobFinished]: JobEventDTO, // jobFinished
  [EMAIL_TYPES.newContentAdded]: ObjectIdInputDTO, // newContentAdded
  [EMAIL_TYPES.memberChangedAddedRemoved]: MemberChangedDTO, // memberChangedAddedRemoved
  [EMAIL_TYPES.spaceChanged]: SpaceChangedDTO, // spaceChanged
  [EMAIL_TYPES.commentAdded]: ObjectIdInputDTO, // commentAdded
  [EMAIL_TYPES.challengeOpened]: ChallengeOpenedDTO, // challengeOpened
  [EMAIL_TYPES.challengePrereg]: ChallengeCreatedDTO, // challengePrereg
  [EMAIL_TYPES.jobTerminationWarning]: EmptyEmailInputDTO, // jobTerminationWarning
  [EMAIL_TYPES.staleJobsReport]: EmptyEmailInputDTO, // staleJobsReport
  [EMAIL_TYPES.nonTerminatedDbClusters]: EmptyEmailInputDTO, // nonTerminatedDbClusters
  [EMAIL_TYPES.jobFailed]: JobEventDTO, // jobFailed
  [EMAIL_TYPES.adminDataConsistencyReport]: EmptyEmailInputDTO, // adminDataConsistencyReport
  [EMAIL_TYPES.userDataConsistencyReport]: EmptyEmailInputDTO, // userDataConsistencyReport
  [EMAIL_TYPES.spaceDiscussion]: EmptyEmailInputDTO, // spaceDiscussion
  [EMAIL_TYPES.spaceCreated]: EmptyEmailInputDTO, // spaceCreated
  [EMAIL_TYPES.userInactivityAlert]: EmptyEmailInputDTO, // userInactivityAlert
  [EMAIL_TYPES.alertMessage]: AlertMessageInputDTO, // alertMessage
  [EMAIL_TYPES.expertQuestionAdded]: ObjectIdInputDTO, // expertQuestionAdded
  [EMAIL_TYPES.expertAdded]: ObjectIdInputDTO, // expertQuestionAdded
  [EMAIL_TYPES.challengeProposalReceived]: ChallengeProposalInputDTO, // challengeProposalReceived
  [EMAIL_TYPES.guestAccessEmail]: ObjectIdInputDTO, // guestAccessEmail
  [EMAIL_TYPES.licenseApprovalRequest]: LicenseApprovalRequestDTO, // licenseApprovalRequest
  [EMAIL_TYPES.licenseApproved]: ObjectIdInputDTO, // licenseApproved
  [EMAIL_TYPES.licenseRevoked]: ObjectIdInputDTO, // licenseRevoked
  [EMAIL_TYPES.spaceActivated]: ObjectIdInputDTO, // spaceActivated
  [EMAIL_TYPES.spaceActivation]: ObjectIdInputDTO, // spaceActivation
  [EMAIL_TYPES.invitation]: ObjectIdInputDTO, // invitation to the pFDA
  [EMAIL_TYPES.spaceInvitation]: InvitationToSpaceDTO, // invitation to the space
  [EMAIL_TYPES.nodeCopy]: NodeCopyInputDTO, // some nodes weren't copied
  [EMAIL_TYPES.userProvisioned]: UserProvisionedDto, // userProvisioned
} satisfies Record<EMAIL_TYPES, new () => object>

export type EmailTypeToInputMap = {
  [K in keyof typeof emailTypeToInputDtoMap]: (typeof emailTypeToInputDtoMap)[K] extends new () => infer R
    ? R
    : (typeof emailTypeToInputDtoMap)[K]
}
