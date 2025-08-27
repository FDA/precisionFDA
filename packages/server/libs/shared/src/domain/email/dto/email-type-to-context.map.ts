import { Challenge } from '@shared/domain/challenge/challenge.entity'
import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { EmptyEmailInputDTO } from '@shared/domain/email/dto/empty-email-input.dto'
import { AlertMessageInputDTO } from '@shared/domain/email/dto/alert-message-input.dto'
import { ChallengeProposalInputDTO } from '@shared/domain/email/dto/challenge-proposal.dto'
import { NodeCopyInputDTO } from '@shared/domain/email/dto/node-copy-input.dto'
import { EmailTypeToInputMap } from '@shared/domain/email/dto/email-type-to-input.map'
import { ExpertQuestion } from '@shared/domain/expert-question/entity/expert-question.entity'
import { Expert } from '@shared/domain/expert/entity/expert.entity'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { User } from '@shared/domain/user/user.entity'
import { Space } from '@shared/domain/space/space.entity'
import { MemberChangeTemplateInput } from '@shared/domain/email/templates/mjml/member-change.template'
import { LoadedReference } from '@mikro-orm/core'
import { AcceptedLicense } from '@shared/domain/accepted-license/accepted-license.entity'
import { License } from '@shared/domain/license/license.entity'
import { Job } from '@shared/domain/job/job.entity'
import { JobFailedInputTemplate } from '@shared/domain/email/templates/mjml/job-failed.template'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { Comment } from '@shared/domain/comment/comment.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { App } from '@shared/domain/app/app.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'

export type ChallengeOpenedContext = {
  challenge: Challenge
  input: EmailTypeToInputMap[EMAIL_TYPES.challengeOpened]
}

export type SpaceInvitationContext = {
  membership: SpaceMembership
  admin: User // the user who added this membership
  input: EmailTypeToInputMap[EMAIL_TYPES.spaceInvitation]
}

export type SpaceChangedContext = {
  space: Space
  user: User
  receiversSides: object
  spaceMembership: SpaceMembership
  spaceMembershipSide: string | object
  receiverMembershipSide: string | object
  input: EmailTypeToInputMap[EMAIL_TYPES.spaceChanged]
}

export type SpaceActivationContext = {
  spaceMembership: SpaceMembership
  input: EmailTypeToInputMap[EMAIL_TYPES.spaceActivation]
}

export type SpaceActivatedContext = {
  spaceMembership: SpaceMembership
  input: EmailTypeToInputMap[EMAIL_TYPES.spaceActivated]
}

export type MemberChangedContext = {
  space: Space
  user: User
  content: MemberChangeTemplateInput['content']
  updatedMembership: SpaceMembership & {
    user: LoadedReference<User>
  }
  input: EmailTypeToInputMap[EMAIL_TYPES.memberChangedAddedRemoved]
}

export type LicenseRevokedContext = {
  acceptedLicense: AcceptedLicense
  license: License
  input: EmailTypeToInputMap[EMAIL_TYPES.licenseRevoked]
}

export type LicenseApprovedContext = {
  acceptedLicense: AcceptedLicense
  input: EmailTypeToInputMap[EMAIL_TYPES.licenseApproved]
}

export type ChallengePreregContext = {
  challenge: Challenge | null
  input: EmailTypeToInputMap[EMAIL_TYPES.challengePrereg]
}

export type LicenseApprovalContext = {
  license: License
  requester: User
  requesterName: string
  input: EmailTypeToInputMap[EMAIL_TYPES.licenseApprovalRequest]
}

export type JobFinishedContext = {
  job: Job
  input: EmailTypeToInputMap[EMAIL_TYPES.jobFinished]
}

export type JobFailedContext = {
  job: Job
  body: (data: JobFailedInputTemplate) => string
  input: EmailTypeToInputMap[EMAIL_TYPES.jobFailed]
}

export type InvitationContext = {
  invitation: Invitation
  input: EmailTypeToInputMap[EMAIL_TYPES.invitation]
}

export type ExpertQuestionAddedContext = {
  expertQuestion: ExpertQuestion
  questionAuthor: User
  input: EmailTypeToInputMap[EMAIL_TYPES.expertQuestionAdded]
}

export type ExpertAddedContext = {
  expert: Expert
  input: EmailTypeToInputMap[EMAIL_TYPES.expertAdded]
}

export type ContentChangedContext = {
  spaceEvent: SpaceEvent
  input: EmailTypeToInputMap[EMAIL_TYPES.newContentAdded]
}

export type CommentAddedContext = {
  comment: Comment & { user: LoadedReference<User> }
  spaceEvent: SpaceEvent & { space: LoadedReference<Space> }
  userFile?: UserFile & { user: LoadedReference<User> }
  app?: App & { user: LoadedReference<User> }
  job?: Job & { user: LoadedReference<User> }
  // to add workflow commenting in Home refactoring, on Rails side
  // workflow: Workflow
  objectCommentsLink?: string
  input: EmailTypeToInputMap[EMAIL_TYPES.commentAdded]
}

export type DiscussionContext = {
  discussion: Discussion
  space?: Space
  discussionLink: string
  input:
    | EmailTypeToInputMap[EMAIL_TYPES.newDiscussion]
    | EmailTypeToInputMap[EMAIL_TYPES.newDiscussionReply]
}

type EmailTypeToContextMapOverride = {
  [EMAIL_TYPES.emailWithoutTemplate]: EmptyEmailInputDTO
  [EMAIL_TYPES.jobFinished]: JobFinishedContext
  [EMAIL_TYPES.newContentAdded]: ContentChangedContext
  [EMAIL_TYPES.memberChangedAddedRemoved]: MemberChangedContext
  [EMAIL_TYPES.spaceChanged]: SpaceChangedContext
  [EMAIL_TYPES.commentAdded]: CommentAddedContext
  [EMAIL_TYPES.challengeOpened]: ChallengeOpenedContext
  [EMAIL_TYPES.challengePrereg]: ChallengePreregContext
  [EMAIL_TYPES.jobTerminationWarning]: EmptyEmailInputDTO
  [EMAIL_TYPES.staleJobsReport]: EmptyEmailInputDTO
  [EMAIL_TYPES.nonTerminatedDbClusters]: EmptyEmailInputDTO
  [EMAIL_TYPES.jobFailed]: JobFailedContext
  [EMAIL_TYPES.adminDataConsistencyReport]: EmptyEmailInputDTO
  [EMAIL_TYPES.userDataConsistencyReport]: EmptyEmailInputDTO
  [EMAIL_TYPES.spaceDiscussion]: EmptyEmailInputDTO
  [EMAIL_TYPES.spaceCreated]: EmptyEmailInputDTO
  [EMAIL_TYPES.userInactivityAlert]: EmptyEmailInputDTO
  [EMAIL_TYPES.alertMessage]: AlertMessageInputDTO
  [EMAIL_TYPES.expertQuestionAdded]: ExpertQuestionAddedContext
  [EMAIL_TYPES.expertAdded]: ExpertAddedContext
  [EMAIL_TYPES.challengeProposalReceived]: ChallengeProposalInputDTO
  [EMAIL_TYPES.licenseApprovalRequest]: LicenseApprovalContext
  [EMAIL_TYPES.licenseApproved]: LicenseApprovedContext
  [EMAIL_TYPES.licenseRevoked]: LicenseRevokedContext
  [EMAIL_TYPES.spaceActivated]: SpaceActivatedContext
  [EMAIL_TYPES.spaceActivation]: SpaceActivationContext
  [EMAIL_TYPES.invitation]: InvitationContext
  [EMAIL_TYPES.spaceInvitation]: SpaceInvitationContext
  [EMAIL_TYPES.nodeCopy]: NodeCopyInputDTO
  [EMAIL_TYPES.newDiscussion]: DiscussionContext
  [EMAIL_TYPES.newDiscussionReply]: DiscussionContext
}

export type EmailTypeToContextMap = {
  [K in EMAIL_TYPES]: K extends keyof EmailTypeToContextMapOverride
    ? EmailTypeToContextMapOverride[K]
    : EmailTypeToInputMap[K]
}
