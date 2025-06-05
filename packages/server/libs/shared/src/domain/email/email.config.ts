import { emailTypeToInputDtoMap } from '@shared/domain/email/dto/email-type-to-input.map'
import { AlertMessageHandler } from '@shared/domain/email/templates/handlers/alert-message.handler'
import { ChallengeOpenedEmailHandler } from '@shared/domain/email/templates/handlers/challenge-opened.handler'
import { ChallengePreregEmailHandler } from '@shared/domain/email/templates/handlers/challenge-prereg.handler'
import { ChallengeProposalReceivedHandler } from '@shared/domain/email/templates/handlers/challenge-proposal-received.handler'
import { CommentAddedEmailHandler } from '@shared/domain/email/templates/handlers/comment-added.handler'
import { ContentChangedEmailHandler } from '@shared/domain/email/templates/handlers/content-change.handler'
import { ExpertAddedHandler } from '@shared/domain/email/templates/handlers/expert-added.handler'
import { ExpertQuestionAddedHandler } from '@shared/domain/email/templates/handlers/expert-question-added.handler'
import { GuestAccessEmailHandler } from '@shared/domain/email/templates/handlers/guest-access-email.handler'
import { InvitationHandler } from '@shared/domain/email/templates/handlers/invitation.handler'
import { JobFailedEmailHandler } from '@shared/domain/email/templates/handlers/job-failed.handler'
import { JobFinishedEmailHandler } from '@shared/domain/email/templates/handlers/job-finished.handler'
import { LicenseApprovalRequestHandler } from '@shared/domain/email/templates/handlers/license-approval-request.handler'
import { LicenseApprovedHandler } from '@shared/domain/email/templates/handlers/license-approved.handler'
import { LicenseRevokedHandler } from '@shared/domain/email/templates/handlers/license-revoked.handler'
import { MemberChangedEmailHandler } from '@shared/domain/email/templates/handlers/member-change.handler'
import { NodeCopyHandler } from '@shared/domain/email/templates/handlers/node-copy.handler'
import { SpaceActivatedHandler } from '@shared/domain/email/templates/handlers/space-activated.handler'
import { SpaceActivationHandler } from '@shared/domain/email/templates/handlers/space-activation.handler'
import { SpaceChangedEmailHandler } from '@shared/domain/email/templates/handlers/space-change.handler'
import { SpaceInvitationHandler } from '@shared/domain/email/templates/handlers/space-invitation.handler'
import { UserProvisionedHandler } from '@shared/domain/email/templates/handlers/user-provisioned.handler'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { User } from '@shared/domain/user/user.entity'
import { groupBy, map, mergeAll, pipe, prop } from 'ramda'
import { OpsCtx } from '../../types'

// KEY NAMES AND DEFAULT VALUES FOR EMAIL NOTIFICATION SETTINGS

/**
 * List of all notification bases, which may be applied to a role.
 */
export const NOTIFICATION_TYPES_BASE = {
  membership_changed: true,
  member_added_to_space: true,
  comment_activity: true,
  content_added_or_deleted: true,
  space_locked_unlocked_deleted: true,
  job_finished: true,
  job_failed: true,
  challenge_opened: true,
  challenge_preregister: true,
  alert_message: true,
  expert_question_added: true,
  expert_added: true,
  challenge_proposal_received: true,
  guest_access_email: true,
  license_approval_request: true,
  license_approved: true,
  license_revoked: true,
  space_activated: true,
  space_activation: true,
  invitation: true,
  space_invitation: true,
  node_copy: true,
  user_provisioned: true,
}

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  reviewer_membership_changed: false,
  reviewer_comment_activity: true,
  reviewer_content_added_or_deleted: false,
  sponsor_membership_changed: false,
  sponsor_comment_activity: true,
  sponsor_content_added_or_deleted: false,
  reviewer_lead_membership_changed: true,
  reviewer_lead_comment_activity: true,
  reviewer_lead_content_added_or_deleted: true,
  reviewer_lead_member_added_to_space: true,
  reviewer_lead_space_locked_unlocked_deleted: true,
  sponsor_lead_membership_changed: true,
  sponsor_lead_comment_activity: true,
  sponsor_lead_content_added_or_deleted: true,
  sponsor_lead_member_added_to_space: true,
  sponsor_lead_space_locked_unlocked_deleted: true,
  admin_membership_changed: true,
  admin_comment_activity: true,
  admin_content_added_or_deleted: true,
  admin_member_added_to_space: true,
  admin_space_locked_unlocked_deleted: true,
  private_job_finished: false,
  private_challenge_opened: true,
  private_challenge_preregister: true,
}

/**
 * List of notification roles, roles are represented by a prefix in the DB column,
 * so we want to document this mapping.
 */
export const NOTIFICATION_ROLE_PREFIXES = {
  admin: 'admin',
  reviewer_lead: 'reviewer_lead',
  sponsor_lead: 'sponsor_lead',
  reviewer: 'reviewer',
  sponsor: 'sponsor',
  privateScope: 'private',
}
/**
 * notification types should be build with this combination:
 *  `${NOTIFICATION_ROLE_PREFIXES[something]}_${NOTIFICATION_TYPES_BASE[something]}`
 *
 * the enum with prefixes will be used to determine if user (and their role in given context)
 * should receive the notification.
 *
 * Example:
 *  - user 1, space 1, 2
 *  - user 1 is lead in space 1, member of space 2
 *  - space event of "new content added" occurs in space 1
 *    -> "lead_content_added_or_deleted" notification key is used to determine if email is sent
 *  - space event of "new content added" occurs in space 2
 *    -> "all_content_added_or_deleted" key is used
 */

const NOTIFICATION_TYPES_REVIEWER = {
  reviewer_membership_changed: true,
  reviewer_comment_activity: true,
  reviewer_content_added_or_deleted: true,
}

const NOTIFICATION_TYPES_SPONSOR = {
  sponsor_membership_changed: true,
  sponsor_comment_activity: true,
  sponsor_content_added_or_deleted: true,
}

const NOTIFICATION_TYPES_REVIEWER_LEAD = {
  reviewer_lead_membership_changed: true,
  reviewer_lead_comment_activity: true,
  reviewer_lead_content_added_or_deleted: true,
  reviewer_lead_member_added_to_space: true,
  reviewer_lead_space_locked_unlocked_deleted: true,
}

const NOTIFICATION_TYPES_SPONSOR_LEAD = {
  sponsor_lead_membership_changed: true,
  sponsor_lead_comment_activity: true,
  sponsor_lead_content_added_or_deleted: true,
  sponsor_lead_member_added_to_space: true,
  sponsor_lead_space_locked_unlocked_deleted: true,
}

const NOTIFICATION_TYPES_ADMIN = {
  admin_membership_changed: true,
  admin_comment_activity: true,
  admin_content_added_or_deleted: true,
  admin_member_added_to_space: true,
  admin_space_locked_unlocked_deleted: true,
}

const NOTIFICATION_PRIVATE = {
  private_job_finished: true,
  private_job_failed: true,
  private_challenge_opened: true,
  private_challenge_preregister: true,
}

// we use as any here to overwrite mergeAll type declaration
export const NOTIFICATION_TYPES: Partial<typeof NOTIFICATION_TYPES_ADMIN> &
  Partial<typeof NOTIFICATION_TYPES_REVIEWER> &
  Partial<typeof NOTIFICATION_TYPES_SPONSOR> &
  Partial<typeof NOTIFICATION_TYPES_REVIEWER_LEAD> &
  Partial<typeof NOTIFICATION_TYPES_SPONSOR_LEAD> &
  Partial<typeof NOTIFICATION_PRIVATE> = mergeAll([
  NOTIFICATION_TYPES_ADMIN,
  NOTIFICATION_TYPES_REVIEWER,
  NOTIFICATION_TYPES_SPONSOR,
  NOTIFICATION_TYPES_REVIEWER_LEAD,
  NOTIFICATION_TYPES_SPONSOR_LEAD,
  NOTIFICATION_PRIVATE,
])

/**
 * It still comes as snake case from rails.
 */
export type ChallengeProposalInput = {
  name: string
  email: string
  organisation: string
  specific_question: string
  specific_question_text: string
  data_details: string
  data_details_text: string
}

// EMAIL OPERATIONS INPUTS

export type EmailProcessInput<T extends EMAIL_TYPES> = {
  emailTypeId: number
  receiverUserIds: number[]
  input: InstanceType<(typeof emailTypeToInputDtoMap)[T]>
}

export type EmailSendInput = {
  emailType: EMAIL_TYPES
  from?: string
  to: string
  subject: string
  bcc?: string
  replyTo?: string
  body?: string
}

export type EmailTemplateInput = { receiver: User }

// fixme: NOTIFICATION_TYPES into EMAIL_TYPES mapping

// EMAIL CONFIG AND HELPERS
export type EmailTemplateConstructor = new (
  emailTypeId: number,
  // @ts-ignore let's leave something for future PRs
  emailInput: any,
  ctx: OpsCtx,
  receiverUserIds: number[],
  // @ts-ignore let's leave something for future PRs
) => EmailTemplate

export interface EmailTemplate<T> {
  config: EmailConfigItem
  emailType: EMAIL_TYPES
  ctx: OpsCtx
  templateFile: (data: T) => string

  // validate(payload: any): void
  determineReceivers(): Promise<User[]>
  template(receiver: User): Promise<EmailSendInput>
  getNotificationKey(spaceEvent?: SpaceEvent): keyof typeof NOTIFICATION_TYPES_BASE
  setupContext(): Promise<void>
}

export enum EMAIL_TYPES {
  emailWithoutTemplate = 0,
  jobFinished = 1,
  newContentAdded = 2,
  memberChangedAddedRemoved = 3,
  spaceChanged = 4,
  commentAdded = 5,
  challengeOpened = 6,
  challengePrereg = 7,
  jobTerminationWarning = 8,
  staleJobsReport = 9,
  nonTerminatedDbClusters = 10,
  jobFailed = 11,
  adminDataConsistencyReport = 12,
  userDataConsistencyReport = 13,
  spaceDiscussion = 14,
  spaceCreated = 15,
  userInactivityAlert = 16,
  alertMessage = 17,
  expertQuestionAdded = 18,
  expertAdded = 19,
  challengeProposalReceived = 20,
  guestAccessEmail = 21,
  licenseApprovalRequest = 22,
  licenseApproved = 23,
  licenseRevoked = 24,
  spaceActivated = 25,
  spaceActivation = 26,
  invitation = 27, // invitation to the pFDA
  spaceInvitation = 28,
  nodeCopy = 29,
  userProvisioned = 30,
}

export type EmailConfigItem = {
  // unique name
  name: string
  // API param value -> EMAIL_TYPE, must be also unique
  emailId: number
  // handler for given email type
  handlerClass: EmailTemplateConstructor
}

export const EMAIL_CONFIG = {
  userProvisioned: {
    name: 'userProvisioned',
    emailId: EMAIL_TYPES.userProvisioned,
    handlerClass: UserProvisionedHandler,
  },
  nodeCopy: {
    name: 'nodeCopy',
    emailId: EMAIL_TYPES.nodeCopy,
    handlerClass: NodeCopyHandler,
  },
  spaceInvitation: {
    name: 'spaceInvitation',
    emailId: EMAIL_TYPES.spaceInvitation,
    handlerClass: SpaceInvitationHandler,
  },
  invitation: {
    name: 'invitation',
    emailId: EMAIL_TYPES.invitation,
    handlerClass: InvitationHandler,
  },
  spaceActivation: {
    name: 'spaceActivation',
    emailId: EMAIL_TYPES.spaceActivation,
    handlerClass: SpaceActivationHandler,
  },
  spaceActivated: {
    name: 'spaceActivated',
    emailId: EMAIL_TYPES.spaceActivated,
    handlerClass: SpaceActivatedHandler,
  },
  licenseRevoked: {
    name: 'licenseRevoked',
    emailId: EMAIL_TYPES.licenseRevoked,
    handlerClass: LicenseRevokedHandler,
  },
  licenseApproved: {
    name: 'licenseApproved',
    emailId: EMAIL_TYPES.licenseApproved,
    handlerClass: LicenseApprovedHandler,
  },
  licenseApprovalRequest: {
    name: 'licenseApprovalRequest',
    emailId: EMAIL_TYPES.licenseApprovalRequest,
    handlerClass: LicenseApprovalRequestHandler,
  },
  guestAccessEmail: {
    name: 'guestAccessEmail',
    emailId: EMAIL_TYPES.guestAccessEmail,
    handlerClass: GuestAccessEmailHandler,
  },
  challengeProposalReceived: {
    name: 'challengeProposalReceived',
    emailId: EMAIL_TYPES.challengeProposalReceived,
    handlerClass: ChallengeProposalReceivedHandler,
  },
  expertAdded: {
    name: 'expertAdded',
    emailId: EMAIL_TYPES.expertAdded,
    handlerClass: ExpertAddedHandler,
  },
  expertQuestionAdded: {
    name: 'expertQuestionAdded',
    emailId: EMAIL_TYPES.expertQuestionAdded,
    handlerClass: ExpertQuestionAddedHandler,
  },
  alertMessage: {
    name: 'alertMessage',
    emailId: EMAIL_TYPES.alertMessage,
    handlerClass: AlertMessageHandler,
  },
  jobFinished: {
    name: 'jobFinished',
    emailId: EMAIL_TYPES.jobFinished,
    handlerClass: JobFinishedEmailHandler,
  },
  jobFailed: {
    name: 'jobFailed',
    emailId: EMAIL_TYPES.jobFailed,
    handlerClass: JobFailedEmailHandler,
  },
  newContentAdded: {
    name: 'newContentAdded',
    emailId: EMAIL_TYPES.newContentAdded,
    handlerClass: ContentChangedEmailHandler,
  },
  memberChangedAddedRemoved: {
    name: 'memberChangedAddedRemoved',
    emailId: EMAIL_TYPES.memberChangedAddedRemoved,
    handlerClass: MemberChangedEmailHandler,
  },
  spaceChanged: {
    name: 'spaceChanged',
    emailId: EMAIL_TYPES.spaceChanged,
    handlerClass: SpaceChangedEmailHandler,
  },
  commentAdded: {
    name: 'commentAdded',
    emailId: EMAIL_TYPES.commentAdded,
    handlerClass: CommentAddedEmailHandler,
  },
  challengeOpened: {
    name: 'challengeOpened',
    emailId: EMAIL_TYPES.challengeOpened,
    handlerClass: ChallengeOpenedEmailHandler,
  },
  challengePrereg: {
    name: 'challengePrereg',
    emailId: EMAIL_TYPES.challengePrereg,
    handlerClass: ChallengePreregEmailHandler,
  },
} as const

// { '1': { email_config_object } } structure
const emailConfigPerId = pipe(
  groupBy((elem: { emailId: number }) => {
    const value: number = prop('emailId')(elem)
    return value.toString()
  }),
  // key is the emailId, value is the Array<config object>
  map<{ [key: string]: any[] }, { [key: string]: EmailConfigItem }>((elem: any[]) => {
    if (elem.length > 1) {
      throw new Error(`EmailId=${elem.pop().emailId} is used more than once`)
    }
    return elem.pop()
  }),
)(Object.values(EMAIL_CONFIG))

export const getEmailConfig = (emailId: number): EmailConfigItem => {
  const emailConfig = emailConfigPerId[emailId.toString()]
  if (!emailConfig) {
    throw new Error(`Email config for emailId=${emailId} not found`)
  }
  return emailConfig
}
