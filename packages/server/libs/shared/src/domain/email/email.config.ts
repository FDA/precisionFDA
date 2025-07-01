import { EMAIL_TYPES } from '@shared/domain/email/model/email-types'
import { User } from '@shared/domain/user/user.entity'
import { mergeAll } from 'ramda'

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
  group_lead_membership_changed: true,
  group_lead_comment_activity: true,
  group_lead_content_added_or_deleted: true,
  group_lead_member_added_to_space: true,
  group_lead_space_locked_unlocked_deleted: true,
  group_contributor_membership_changed: false,
  group_contributor_comment_activity: true,
  group_contributor_content_added_or_deleted: false,
  group_viewer_membership_changed: false,
  group_viewer_comment_activity: true,
  group_viewer_content_added_or_deleted: false,
  shared_lead_membership_changed: true,
  shared_lead_comment_activity: true,
  shared_lead_content_added_or_deleted: true,
  shared_lead_member_added_to_space: true,
  shared_lead_space_locked_unlocked_deleted: true,
  shared_contributor_membership_changed: false,
  shared_contributor_comment_activity: true,
  shared_contributor_content_added_or_deleted: false,
  shared_viewer_membership_changed: false,
  shared_viewer_comment_activity: true,
  shared_viewer_content_added_or_deleted: false,
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
export const NOTIFICATION_ROLE = {
  admin: 'admin',
  lead: 'lead',
  contributor: 'contributor',
  viewer: 'viewer',
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

const NOTIFICATION_TYPES_GROUP_LEAD = {
  group_lead_membership_changed: true,
  group_lead_comment_activity: true,
  group_lead_content_added_or_deleted: true,
  group_lead_member_added_to_space: true,
  group_lead_space_locked_unlocked_deleted: true,
}

const NOTIFICATION_TYPES_GROUP_CONTRIBUTOR = {
  group_contributor_membership_changed: true,
  group_contributor_comment_activity: true,
  group_contributor_content_added_or_deleted: true,
}

const NOTIFICATION_TYPES_GROUP_VIEWER = {
  group_viewer_membership_changed: true,
  group_viewer_comment_activity: true,
  group_viewer_content_added_or_deleted: true,
}

const NOTIFICATION_TYPES_SHARED_LEAD = {
  shared_lead_membership_changed: true,
  shared_lead_comment_activity: true,
  shared_lead_content_added_or_deleted: true,
  shared_lead_member_added_to_space: true,
  shared_lead_space_locked_unlocked_deleted: true,
}

const NOTIFICATION_TYPES_SHARED_CONTRIBUTOR = {
  shared_contributor_membership_changed: true,
  shared_contributor_comment_activity: true,
  shared_contributor_content_added_or_deleted: true,
}

const NOTIFICATION_TYPES_SHARED_VIEWER = {
  shared_viewer_membership_changed: true,
  shared_viewer_comment_activity: true,
  shared_viewer_content_added_or_deleted: true,
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
  Partial<typeof NOTIFICATION_TYPES_GROUP_LEAD> &
  Partial<typeof NOTIFICATION_TYPES_GROUP_CONTRIBUTOR> &
  Partial<typeof NOTIFICATION_TYPES_GROUP_VIEWER> &
  Partial<typeof NOTIFICATION_TYPES_SHARED_LEAD> &
  Partial<typeof NOTIFICATION_TYPES_SHARED_CONTRIBUTOR> &
  Partial<typeof NOTIFICATION_TYPES_SHARED_VIEWER> &
  Partial<typeof NOTIFICATION_PRIVATE> = mergeAll([
  NOTIFICATION_TYPES_ADMIN,
  NOTIFICATION_TYPES_GROUP_LEAD,
  NOTIFICATION_TYPES_GROUP_CONTRIBUTOR,
  NOTIFICATION_TYPES_GROUP_VIEWER,
  NOTIFICATION_TYPES_SHARED_LEAD,
  NOTIFICATION_TYPES_SHARED_CONTRIBUTOR,
  NOTIFICATION_TYPES_SHARED_VIEWER,
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
