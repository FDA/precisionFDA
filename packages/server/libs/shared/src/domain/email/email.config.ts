import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { mergeAll } from 'ramda'
import { EmailHandler } from '@shared/domain/email/templates/handlers/email.handler'

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

export type EmailSendInput = {
  emailType: EMAIL_TYPES
  to: string
  subject: string
  bcc?: string
  replyTo?: string
  returnAddress?: string // where it should go if not delivered
  body?: string
}

export type EmailTemplateInput = { receiver: User }

export type EmailConfigItem<T extends EMAIL_TYPES = EMAIL_TYPES> = {
  // unique name
  name: string
  // API param value -> EMAIL_TYPE, must be also unique
  emailId: T
  // handler for given email type
  handlerClass: new (...args: unknown[]) => EmailHandler<T>
}
