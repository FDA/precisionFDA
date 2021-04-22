import { groupBy, map, mergeAll, pipe, prop } from 'ramda'
import type { JSONSchema7 } from 'json-schema'
import { AnyObject, OpsCtx } from '../../types'
import { schemas, enumUtils } from '../../utils'
import { SpaceEvent, User } from '..'
import { SPACE_EVENT_ACTIVITY_TYPE } from '../space-event/space-event.enum'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership/space-membership.enum'
import { handlers } from './templates'

// KEY NAMES AND DEFAULT VALUES FOR EMAIL NOTIFICATION SETTINGS

/**
 * List of all notification bases, which may be applied to a role.
 */
const NOTIFICATION_TYPES_BASE = {
  // space event based
  membership_changed: true,
  member_added_or_removed_from_space: true,
  comment_activity: true,
  content_added_or_deleted: true,
  space_locked_unlocked_deleted: true,
  // todo: deprecated?
  space_lock_unlock_delete_requests: true,
  // deprecated
  new_task_assigned: true,
  task_status_changed: true,
  // jobs
  job_finished: true,
  // challenges
  challenge_added: true,
}

/**
 * List of notification roles, roles are represented by a prefix in the DB column,
 * so we want to document this mapping.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NOTIFICATION_ROLE_PREFIXES = {
  spaceLead: 'lead',
  spaceAdmin: 'admin',
  spaceMember: 'all',
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

const NOTIFICATION_TYPES_COMMON = {
  all_membership_changed: true,
  all_new_task_assigned: true,
  all_task_status_changed: true,
  all_comment_activity: true,
  all_content_added_or_deleted: true,
}

const NOTIFICATION_TYPES_LEAD = {
  lead_membership_changed: true,
  lead_new_task_assigned: true,
  lead_task_status_changed: true,
  lead_comment_activity: true,
  lead_content_added_or_deleted: true,
  lead_member_added_or_removed_from_space: true,
  lead_space_locked_unlocked_deleted: true,
}

const NOTIFICATION_TYPES_ADMIN = {
  admin_membership_changed: true,
  admin_new_task_assigned: true,
  admin_task_status_changed: true,
  admin_comment_activity: true,
  admin_content_added_or_deleted: true,
  admin_member_added_or_removed_from_space: true,
  admin_space_locked_unlocked_deleted: true,
  admin_space_lock_unlock_delete_requests: true,
}

// todo: extend with more email types
const NOTIFICATION_PRIVATE = {
  private_job_finished: true,
}

// we use as any here to overwrite mergeAll type declaration
const NOTIFICATION_TYPES: Partial<typeof NOTIFICATION_TYPES_COMMON> &
  Partial<typeof NOTIFICATION_TYPES_LEAD> &
  Partial<typeof NOTIFICATION_TYPES_ADMIN> &
  Partial<typeof NOTIFICATION_PRIVATE> = mergeAll([
  NOTIFICATION_TYPES_COMMON,
  NOTIFICATION_TYPES_LEAD,
  NOTIFICATION_TYPES_ADMIN,
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
  spaceEventEmailSchema,
  spaceChangedEmailSchema,
  membershipChangedEmailSchema,
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
}

// EMAIL OPERATIONS INPUTS

type EmailProcessInput = {
  emailTypeId: number
  receiverUserIds: number[]
  input: AnyObject
}

type EmailSendInput = {
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

type EMAIL_TYPES =
  | 'jobFinished'
  | 'newContentAdded'
  | 'memberChangedAddedRemoved'
  | 'spaceChanged'
  | 'commentAdded'
type EmailConfigItem = {
  // unique name
  name: EMAIL_TYPES
  // API param value -> EMAIL_TYPE, must be also unique
  emailId: number
  // schema used from ajv validation
  // optional, some emails may not require any dynamic content
  schema?: JSONSchema7
  // handler for given email type
  templateClass: EmailTemplateContructor
}

const EMAIL_CONFIG: { [k: string]: EmailConfigItem } = {
  jobFinished: {
    name: 'jobFinished',
    emailId: 1,
    schema: emailInputSchemas.jobFinishedEmailSchema,
    templateClass: handlers.JobFinishedEmailHandler,
  },
  newContentAdded: {
    name: 'newContentAdded',
    emailId: 2,
    schema: emailInputSchemas.spaceEventEmailSchema,
    templateClass: handlers.ContentChangedEmailHandler,
  },
  memberChangedAddedRemoved: {
    name: 'memberChangedAddedRemoved',
    emailId: 3,
    schema: emailInputSchemas.membershipChangedEmailSchema,
    templateClass: handlers.MemberChangedEmailHandler,
  },
  spaceChanged: {
    name: 'spaceChanged',
    emailId: 4,
    schema: emailInputSchemas.spaceChangedEmailSchema,
    templateClass: handlers.SpaceChangedEmailHandler,
  },
  commentAdded: {
    name: 'commentAdded',
    emailId: 5,
    schema: emailInputSchemas.spaceEventEmailSchema,
    templateClass: handlers.CommentAddedEmailHandler,
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
  const config = emailConfigPerId[emailId.toString()]
  if (!config) {
    throw new Error(`Email config for emailId=${emailId} not found`)
  }
  return config
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
}
