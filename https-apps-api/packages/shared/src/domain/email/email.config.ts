/* eslint-disable id-length */
import { groupBy, map, mergeAll, pipe, prop } from 'ramda'
import type { JSONSchema7 } from 'json-schema'
import { AnyObject, OpsCtx } from '../../types'
import { schemas } from '../../utils'
import { User } from '..'
import { JobFinishedEmailTemplate, SpaceNotificationEmailTemplate } from './templates'

// KEY NAMES AND DEFAULT VALUES FOR EMAIL NOTIFICATION SETTINGS

// todo: review, some are deprecated probably
const NOTIFICATION_TYPES_COMMON = {
  all_membership_changed: true,
  all_new_task_assigned: true,
  all_task_status_changed: true,
  all_comment_activity: true,
  all_content_added_or_deleted: true,
} as const

const NOTIFICATION_TYPES_LEAD = {
  lead_membership_changed: true,
  lead_new_task_assigned: true,
  lead_task_status_changed: true,
  lead_comment_activity: true,
  lead_content_added_or_deleted: true,
  lead_member_added_or_removed_from_space: true,
  lead_space_locked_unlocked_deleted: true,
} as const

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
const NOTIFICATION_JOB = {
  job_finished: true,
}

// we use as any here to overwrite mergeAll type declaration
const NOTIFICATION_TYPES: typeof NOTIFICATION_TYPES_COMMON &
  typeof NOTIFICATION_TYPES_LEAD &
  typeof NOTIFICATION_TYPES_ADMIN &
  typeof NOTIFICATION_JOB = mergeAll([
  NOTIFICATION_TYPES_COMMON,
  NOTIFICATION_TYPES_LEAD,
  NOTIFICATION_TYPES_ADMIN,
  NOTIFICATION_JOB,
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

const contentAddedEmailSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    spaceEventId: schemas.idProp,
  },
  required: ['spaceEventId'],
  additionalProperties: false,
}

const emailInputSchemas = {
  jobFinishedEmailSchema,
  contentAddedEmailSchema,
}

type NewContentAdded = { spaceEventId: number }

// EMAIL ENUMS

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

  validate(payload: any): void
  // todo: make this one abstract maybe?
  determineReceivers(...args: any[]): Promise<User[]>
  // determineReceivers(spaceEventId: number): Promise<User[]>
  // getReceivers(): Promise<User[]>
  template(receiver: User): Promise<EmailSendInput>
}

type EMAIL_TYPES = 'jobFinished' | 'newContentAdded'
type EmailConfigItem = {
  // unique name
  name: EMAIL_TYPES
  // API param value -> EMAIL_TYPE, must be also unique
  emailId: number
  // db control field(s) of the notification
  notificationKey: string
  // todo: keep this option in mind for later
  // notificationKeys: readonly string[]
  // schema used from ajv validation
  // optional, some emails may not require any dynamic content
  schema?: JSONSchema7
  templateClass: EmailTemplateContructor
}

const EMAIL_CONFIG: { [k: string]: EmailConfigItem } = {
  jobFinished: {
    name: 'jobFinished',
    emailId: 1,
    notificationKey: 'job_finished',
    // notificationKeys: ['job_finished'],
    schema: emailInputSchemas.jobFinishedEmailSchema,
    templateClass: JobFinishedEmailTemplate,
  },
  newContentAdded: {
    name: 'newContentAdded',
    emailId: 2,
    // notificationKeys: ['all_content_added_or_deleted'],
    notificationKey: 'all_content_added_or_deleted',
    schema: emailInputSchemas.contentAddedEmailSchema,
    templateClass: SpaceNotificationEmailTemplate,
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
  NOTIFICATION_TYPES,
  EmailProcessInput,
  EmailSendInput,
  EmailTemplateInput,
  EmailTemplate,
  EmailTemplateContructor,
  NewContentAdded,
}
