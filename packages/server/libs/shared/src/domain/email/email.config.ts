import { config } from '@shared/config'
import { ChallengeOpenedEmailHandler } from '@shared/domain/email/templates/handlers/challenge-opened.handler'
import { ChallengePreregEmailHandler } from '@shared/domain/email/templates/handlers/challenge-prereg.handler'
import { CommentAddedEmailHandler } from '@shared/domain/email/templates/handlers/comment-added.handler'
import { ContentChangedEmailHandler } from '@shared/domain/email/templates/handlers/content-change.handler'
import { JobFailedEmailHandler } from '@shared/domain/email/templates/handlers/job-failed.handler'
import { JobFinishedEmailHandler } from '@shared/domain/email/templates/handlers/job-finished.handler'
import { MemberChangedEmailHandler } from '@shared/domain/email/templates/handlers/member-change.handler'
import { SpaceChangedEmailHandler } from '@shared/domain/email/templates/handlers/space-change.handler'
import { SpaceEvent } from '@shared/domain/space-event/space-event.entity'
import { User } from '@shared/domain/user/user.entity'
import { schemas } from '@shared/utils/base-schemas'
import { stringValues, stringValuesDowncased } from '@shared/utils/enum-utils'
import type { JSONSchema7 } from 'json-schema'
import { groupBy, map, mergeAll, pipe, prop } from 'ramda'
import { OpsCtx } from '../../types'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../space-event/space-event.enum'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { AlertMessageHandler } from '@shared/domain/email/templates/handlers/alert-message.handler'
import { ExpertQuestionAddedHandler } from '@shared/domain/email/templates/handlers/expert-question-added.handler'
import { ExpertAddedHandler } from '@shared/domain/email/templates/handlers/expert-added.handler'
import { ChallengeProposalReceivedHandler } from '@shared/domain/email/templates/handlers/challenge-proposal-received.handler'
import { emailTypeToInputDtoMap } from '@shared/domain/email/dto/email-type-to-input.map'
import { GuestAccessEmailHandler } from '@shared/domain/email/templates/handlers/guest-access-email.handler'
import { LicenseApprovalRequestHandler } from '@shared/domain/email/templates/handlers/license-approval-request.handler'
import { LicenseApprovedHandler } from '@shared/domain/email/templates/handlers/license-approved.handler'
import { LicenseRevokedHandler } from '@shared/domain/email/templates/handlers/license-revoked.handler'
import { SpaceActivatedHandler } from '@shared/domain/email/templates/handlers/space-activated.handler'
import { SpaceActivationHandler } from '@shared/domain/email/templates/handlers/space-activation.handler'
import { InvitationHandler } from '@shared/domain/email/templates/handlers/invitation.handler'
import { SpaceInvitationHandler } from '@shared/domain/email/templates/handlers/space-invitation.handler'
import { NodeCopyHandler } from '@shared/domain/email/templates/handlers/node-copy.handler'
import { UserProvisionedHandler } from '@shared/domain/email/templates/handlers/user-provisioned.handler'

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

// EMAIL VALIDATION SCHEMAS
const objectIdSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    id: schemas.idProp,
  },
  required: ['id'],
  additionalProperties: false,
}

const invitationToSpaceSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    membershipId: schemas.idProp,
    adminId: schemas.idProp,
  },
  required: ['membershipId', 'adminId'],
  additionalProperties: false,
}

const nodeCopySchema: JSONSchema7 = {
  type: 'object',
  properties: {
    destination: { type: 'string', maxLength: config.validation.maxStrLen },
    notCopiedFolderNames: {
      type: 'array',
      items: { type: 'string', maxLength: config.validation.maxStrLen },
    },
    notCopiedFileNames: {
      type: 'array',
      items: { type: 'string', maxLength: config.validation.maxStrLen },
    },
  },
  required: ['destination', 'notCopiedFolderNames', 'notCopiedFileNames'],
  additionalProperties: false,
}

const licenseApprovalRequest: JSONSchema7 = {
  type: 'object',
  properties: {
    license_id: schemas.idProp,
    user_id: schemas.idProp,
    message: { type: 'string', maxLength: config.validation.maxStrLen },
  },
  required: ['license_id', 'user_id', 'message'],
  additionalProperties: false,
}

const challengeProposalSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: config.validation.maxStrLen },
    email: { type: 'string', format: 'email' },
    organisation: { type: 'string', maxLength: config.validation.maxStrLen },
    specificQuestion: { type: 'string', maxLength: config.validation.maxStrLen },
    specificQuestionText: { type: 'string', maxLength: config.validation.maxStrLen },
    dataDetails: { type: 'string', maxLength: config.validation.maxStrLen },
    dataDetailsText: { type: 'string', maxLength: config.validation.maxStrLen },
  },
}

const alertMessageSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    subject: { type: 'string', maxLength: config.validation.maxStrLen },
    message: { type: 'string', maxLength: config.validation.maxStrLen },
  },
  required: ['message'],
  additionalProperties: false,
}

const jobFinishedEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    jobId: schemas.idProp,
  },
  required: ['jobId'],
  additionalProperties: false,
}

const jobFailedEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    jobId: schemas.idProp,
  },
  required: ['jobId'],
  additionalProperties: false,
}

const challengeStartedEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    challengeId: schemas.idProp,
  },
  required: ['challengeId'],
  additionalProperties: false,
}

const challengeCreatedEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    challengeId: schemas.idProp,
    name: { type: 'string', maxLength: config.validation.maxStrLen },
    scope: { type: 'string', maxLength: config.validation.maxStrLen },
  },
  required: ['challengeId', 'name', 'scope'],
  additionalProperties: false,
}

const userProvisionedSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    firstName: { type: 'string', maxLength: config.validation.maxStrLen },
    username: { type: 'string', maxLength: config.validation.maxStrLen },
    email: { type: 'string', maxLength: config.validation.maxStrLen },
  },
  required: ['firstName', 'username', 'email'],
  additionalProperties: false,
}

const spaceEventEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    spaceEventId: schemas.idProp,
  },
  required: ['spaceEventId'],
  additionalProperties: false,
}

const spaceChangedEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    initUserId: schemas.idProp,
    spaceId: schemas.idProp,
    activityType: { type: 'string', enum: stringValues(SPACE_EVENT_ACTIVITY_TYPE) },
  },
  required: ['initUserId', 'spaceId', 'activityType'],
  additionalProperties: false,
}

const membershipChangedEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    initUserId: schemas.idProp,
    spaceId: schemas.idProp,
    updatedMembershipId: schemas.idProp,
    activityType: { type: 'string', enum: stringValues(SPACE_EVENT_ACTIVITY_TYPE) },
    newMembershipRole: {
      type: 'string',
      enum: stringValuesDowncased(SPACE_MEMBERSHIP_ROLE),
    },
  },
  required: ['initUserId', 'spaceId', 'activityType', 'updatedMembershipId'],
  additionalProperties: false,
}

const emailInputSchemas = {
  objectIdSchema,
  jobFinishedEmailSchema,
  alertMessageSchema,
  jobFailedEmailSchema,
  challengeStartedEmailSchema,
  spaceEventEmailSchema,
  spaceChangedEmailSchema,
  membershipChangedEmailSchema,
  challengeCreatedEmailSchema,
  challengeProposalSchema,
}

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

export type InvitationToSpace = {
  membershipId: number
  adminId: number
}

export type NewContentAdded = { spaceEventId: number }

export type CommentAdded = { spaceEventId: number }

export type MemberChanged = {
  updatedMembershipId: number
  initUserId: number
  spaceId: number
  activityType: keyof typeof SPACE_EVENT_ACTIVITY_TYPE
  newMembershipRole?: keyof typeof SPACE_MEMBERSHIP_ROLE
}

export type SpaceChanged = {
  initUserId: number
  spaceId: number
  activityType: string
  spaceMembershipId: number
}

export type ChallengeOpened = { challengeId: number }

export type ChallengeCreated = { challengeId: number; name: string; scope: string }

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
  // schema used from ajv validation
  // optional, some emails may not require any dynamic content
  schema?: JSONSchema7
  // handler for given email type
  handlerClass: EmailTemplateConstructor
}

export const EMAIL_CONFIG = {
  userProvisioned: {
    name: 'userProvisioned',
    emailId: EMAIL_TYPES.userProvisioned,
    schema: userProvisionedSchema,
    handlerClass: UserProvisionedHandler,
  },
  nodeCopy: {
    name: 'nodeCopy',
    emailId: EMAIL_TYPES.nodeCopy,
    schema: nodeCopySchema,
    handlerClass: NodeCopyHandler,
  },
  spaceInvitation: {
    name: 'spaceInvitation',
    emailId: EMAIL_TYPES.spaceInvitation,
    schema: invitationToSpaceSchema,
    handlerClass: SpaceInvitationHandler,
  },
  invitation: {
    name: 'invitation',
    emailId: EMAIL_TYPES.invitation,
    schema: objectIdSchema,
    handlerClass: InvitationHandler,
  },
  spaceActivation: {
    name: 'spaceActivation',
    emailId: EMAIL_TYPES.spaceActivation,
    schema: objectIdSchema,
    handlerClass: SpaceActivationHandler,
  },
  spaceActivated: {
    name: 'spaceActivated',
    emailId: EMAIL_TYPES.spaceActivated,
    schema: objectIdSchema,
    handlerClass: SpaceActivatedHandler,
  },
  licenseRevoked: {
    name: 'licenseRevoked',
    emailId: EMAIL_TYPES.licenseRevoked,
    schema: objectIdSchema,
    handlerClass: LicenseRevokedHandler,
  },
  licenseApproved: {
    name: 'licenseApproved',
    emailId: EMAIL_TYPES.licenseApproved,
    schema: objectIdSchema,
    handlerClass: LicenseApprovedHandler,
  },
  licenseApprovalRequest: {
    name: 'licenseApprovalRequest',
    emailId: EMAIL_TYPES.licenseApprovalRequest,
    schema: licenseApprovalRequest,
    handlerClass: LicenseApprovalRequestHandler,
  },
  guestAccessEmail: {
    name: 'guestAccessEmail',
    emailId: EMAIL_TYPES.guestAccessEmail,
    schema: objectIdSchema,
    handlerClass: GuestAccessEmailHandler,
  },
  challengeProposalReceived: {
    name: 'challengeProposalReceived',
    emailId: EMAIL_TYPES.challengeProposalReceived,
    schema: challengeProposalSchema,
    handlerClass: ChallengeProposalReceivedHandler,
  },
  expertAdded: {
    name: 'expertAdded',
    emailId: EMAIL_TYPES.expertAdded,
    schema: objectIdSchema,
    handlerClass: ExpertAddedHandler,
  },
  expertQuestionAdded: {
    name: 'expertQuestionAdded',
    emailId: EMAIL_TYPES.expertQuestionAdded,
    schema: objectIdSchema,
    handlerClass: ExpertQuestionAddedHandler,
  },
  alertMessage: {
    name: 'alertMessage',
    emailId: EMAIL_TYPES.alertMessage,
    schema: alertMessageSchema,
    handlerClass: AlertMessageHandler,
  },
  jobFinished: {
    name: 'jobFinished',
    emailId: EMAIL_TYPES.jobFinished,
    schema: emailInputSchemas.jobFinishedEmailSchema,
    handlerClass: JobFinishedEmailHandler,
  },
  jobFailed: {
    name: 'jobFailed',
    emailId: EMAIL_TYPES.jobFailed,
    schema: emailInputSchemas.jobFailedEmailSchema,
    handlerClass: JobFailedEmailHandler,
  },
  newContentAdded: {
    name: 'newContentAdded',
    emailId: EMAIL_TYPES.newContentAdded,
    schema: emailInputSchemas.spaceEventEmailSchema,
    handlerClass: ContentChangedEmailHandler,
  },
  memberChangedAddedRemoved: {
    name: 'memberChangedAddedRemoved',
    emailId: EMAIL_TYPES.memberChangedAddedRemoved,
    schema: emailInputSchemas.membershipChangedEmailSchema,
    handlerClass: MemberChangedEmailHandler,
  },
  spaceChanged: {
    name: 'spaceChanged',
    emailId: EMAIL_TYPES.spaceChanged,
    schema: emailInputSchemas.spaceChangedEmailSchema,
    handlerClass: SpaceChangedEmailHandler,
  },
  commentAdded: {
    name: 'commentAdded',
    emailId: EMAIL_TYPES.commentAdded,
    schema: emailInputSchemas.spaceEventEmailSchema,
    handlerClass: CommentAddedEmailHandler,
  },
  challengeOpened: {
    name: 'challengeOpened',
    emailId: EMAIL_TYPES.challengeOpened,
    schema: emailInputSchemas.challengeStartedEmailSchema,
    handlerClass: ChallengeOpenedEmailHandler,
  },
  challengePrereg: {
    name: 'challengePrereg',
    emailId: EMAIL_TYPES.challengePrereg,
    schema: emailInputSchemas.challengeCreatedEmailSchema,
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
