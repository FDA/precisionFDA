import { groupBy, map, mergeAll, pipe, prop } from 'ramda'
import type { JSONSchema7 } from 'json-schema'
import { AnyObject, OpsCtx } from '../../types'
import { schemas, enumUtils } from '../../utils'
import { SpaceEvent, User } from '..'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../space-event/space-event.enum'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { config } from '../..'
import { handlers } from './templates'

// KEY NAMES AND DEFAULT VALUES FOR EMAIL NOTIFICATION SETTINGS

/**
 * List of all notification bases, which may be applied to a role.
 */
const NOTIFICATION_TYPES_BASE = {
  // space event based
  membership_changed: true,
  member_added_to_space: true,
  comment_activity: true,
  content_added_or_deleted: true,
  space_locked_unlocked_deleted: true,
  // jobs
  job_finished: true,
  job_failed: true,
  // challenges
  challenge_opened: true,
  challenge_preregister: true,
}

/**
 * List of notification roles, roles are represented by a prefix in the DB column,
 * so we want to document this mapping.
 */
const NOTIFICATION_ROLE_PREFIXES = {
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
const NOTIFICATION_TYPES:   Partial<typeof NOTIFICATION_TYPES_ADMIN> &
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
]) as any

// EMAIL VALIDATION SCHEMAS

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
    activityType: { type: 'string', enum: enumUtils.stringValues(SPACE_EVENT_ACTIVITY_TYPE) },
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
    activityType: { type: 'string', enum: enumUtils.stringValues(SPACE_EVENT_ACTIVITY_TYPE) },
    newMembershipRole: {
      type: 'string',
      enum: enumUtils.stringValuesDowncased(SPACE_MEMBERSHIP_ROLE),
    },
  },
  required: ['initUserId', 'spaceId', 'activityType', 'updatedMembershipId'],
  additionalProperties: false,
}

const emailInputSchemas = {
  jobFinishedEmailSchema,
  jobFailedEmailSchema,
  challengeStartedEmailSchema,
  spaceEventEmailSchema,
  spaceChangedEmailSchema,
  membershipChangedEmailSchema,
  challengeCreatedEmailSchema,
}

type NewContentAdded = { spaceEventId: number }

type CommentAdded = { spaceEventId: number }

type MemberChanged = {
  updatedMembershipId: number
  initUserId: number
  spaceId: number
  activityType: keyof typeof SPACE_EVENT_ACTIVITY_TYPE
  newMembershipRole?: keyof typeof SPACE_MEMBERSHIP_ROLE
}

type SpaceChanged = {
  initUserId: number
  spaceId: number
  activityType: string
  spaceMembershipId: number
}

type ChallengeOpened = { challengeId: number }

type ChallengeCreated = { challengeId: number; name: string; scope: string }

// EMAIL OPERATIONS INPUTS

type EmailProcessInput = {
  emailTypeId: number
  receiverUserIds: number[]
  input: AnyObject
}

type EmailSendInput = {
  emailType: EMAIL_TYPES,
  to: string
  subject: string
  body: string
}

type EmailTemplateInput = { receiver: User }

// fixme: NOTIFICATION_TYPES into EMAIL_TYPES mapping

// EMAIL CONFIG AND HELPERS
type EmailTemplateContructor = new (
  emailTypeId: number,
  emailInput: any,
  ctx: OpsCtx,
) => EmailTemplate

interface EmailTemplate {
  config: EmailConfigItem
  emailType: EMAIL_TYPES
  ctx: OpsCtx
  templateFile: (data: any) => string

  // validate(payload: any): void
  // todo: make this one abstract maybe?
  determineReceivers(...args: any[]): Promise<User[]>
  template(receiver: User): Promise<EmailSendInput>
  getNotificationKey(spaceEvent?: SpaceEvent): keyof typeof NOTIFICATION_TYPES_BASE
  setupContext(): Promise<void>
}

enum EMAIL_TYPES {
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
}

type EmailConfigItem = {
  // unique name
  name: string
  // API param value -> EMAIL_TYPE, must be also unique
  emailId: number
  // schema used from ajv validation
  // optional, some emails may not require any dynamic content
  schema?: JSONSchema7
  // handler for given email type
  handlerClass: EmailTemplateContructor
}

const EMAIL_CONFIG = {
  jobFinished: {
    name: 'jobFinished',
    emailId: EMAIL_TYPES.jobFinished,
    schema: emailInputSchemas.jobFinishedEmailSchema,
    handlerClass: handlers.JobFinishedEmailHandler,
  },
  jobFailed: {
    name: 'jobFailed',
    emailId: EMAIL_TYPES.jobFailed,
    schema: emailInputSchemas.jobFailedEmailSchema,
    handlerClass: handlers.JobFailedEmailHandler,
  },
  newContentAdded: {
    name: 'newContentAdded',
    emailId: EMAIL_TYPES.newContentAdded,
    schema: emailInputSchemas.spaceEventEmailSchema,
    handlerClass: handlers.ContentChangedEmailHandler,
  },
  memberChangedAddedRemoved: {
    name: 'memberChangedAddedRemoved',
    emailId: EMAIL_TYPES.memberChangedAddedRemoved,
    schema: emailInputSchemas.membershipChangedEmailSchema,
    handlerClass: handlers.MemberChangedEmailHandler,
  },
  spaceChanged: {
    name: 'spaceChanged',
    emailId: EMAIL_TYPES.spaceChanged,
    schema: emailInputSchemas.spaceChangedEmailSchema,
    handlerClass: handlers.SpaceChangedEmailHandler,
  },
  commentAdded: {
    name: 'commentAdded',
    emailId: EMAIL_TYPES.commentAdded,
    schema: emailInputSchemas.spaceEventEmailSchema,
    handlerClass: handlers.CommentAddedEmailHandler,
  },
  challengeOpened: {
    name: 'challengeOpened',
    emailId: EMAIL_TYPES.challengeOpened,
    schema: emailInputSchemas.challengeStartedEmailSchema,
    handlerClass: handlers.ChallengeOpenedEmailHandler,
  },
  challengePrereg: {
    name: 'challengePrereg',
    emailId: EMAIL_TYPES.challengePrereg,
    schema: emailInputSchemas.challengeCreatedEmailSchema,
    handlerClass: handlers.ChallengePreregEmailHandler,
  },
} as const

const emailTypeIds = Object.entries(EMAIL_CONFIG).map(([key, value]) => {
  return value.emailId
})

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

const getEmailConfig = (emailId: number): EmailConfigItem => {
  const emailConfig = emailConfigPerId[emailId.toString()]
  if (!emailConfig) {
    throw new Error(`Email config for emailId=${emailId} not found`)
  }
  return emailConfig
}

export {
  emailTypeIds,
  getEmailConfig,
  EmailConfigItem,
  EMAIL_TYPES,
  EMAIL_CONFIG,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPES_BASE,
  NOTIFICATION_ROLE_PREFIXES,
  EmailProcessInput,
  EmailSendInput,
  EmailTemplateInput,
  EmailTemplate,
  EmailTemplateContructor,
  NewContentAdded,
  MemberChanged,
  SpaceChanged,
  CommentAdded,
  ChallengeOpened,
  ChallengeCreated,
}
