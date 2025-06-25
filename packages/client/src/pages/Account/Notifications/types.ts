export type GroupContributorNotification =
  'group_contributor_membership_changed' |
  'group_contributor_comment_activity' |
  'group_contributor_content_added_or_deleted'

export type SharedContributorNotification =
  'shared_contributor_membership_changed' |
  'shared_contributor_comment_activity' |
  'shared_contributor_content_added_or_deleted'

export type GroupViewerNotification =
  'group_viewer_membership_changed' |
  'group_viewer_comment_activity' |
  'group_viewer_content_added_or_deleted'

export type SharedViewerNotification =
  'shared_viewer_membership_changed' |
  'shared_viewer_comment_activity' |
  'shared_viewer_content_added_or_deleted'

export type GroupLeadNotification =
  'group_lead_membership_changed' |
  'group_lead_comment_activity' |
  'group_lead_content_added_or_deleted' |
  'group_lead_member_added_to_space' |
  'group_lead_space_locked_unlocked_deleted'

export type SharedLeadNotification =
  'shared_lead_membership_changed' |
  'shared_lead_comment_activity' |
  'shared_lead_content_added_or_deleted' |
  'shared_lead_member_added_to_space' |
  'shared_lead_space_locked_unlocked_deleted'

export type ReviewSpaceAdminNotification =
  'admin_membership_changed' |
  'admin_comment_activity' |
  'admin_content_added_or_deleted' |
  'admin_member_added_to_space' |
  'admin_space_locked_unlocked_deleted'

export type PrivateNotification =
  'private_job_finished' |
  'private_challenge_opened' |
  'private_challenge_preregister'

export type AllNotification = GroupContributorNotification |
  SharedContributorNotification |
  GroupViewerNotification |
  SharedViewerNotification |
  GroupLeadNotification |
  SharedLeadNotification |
  ReviewSpaceAdminNotification |
  PrivateNotification

export type NotificationPreferencesPayload = Record<AllNotification, 1 | 0>

export type NotificationPreferences = {
  'group_contributor': Record<GroupContributorNotification, boolean>,
  'shared_contributor': Record<SharedContributorNotification, boolean>,
  'group_viewer': Record<GroupViewerNotification, boolean>,
  'shared_viewer': Record<SharedViewerNotification, boolean>,
  'group_lead': Record<GroupLeadNotification, boolean>,
  'shared_lead': Record<SharedLeadNotification, boolean>,
  'admin': Record<ReviewSpaceAdminNotification, boolean>,
  'private': Record<PrivateNotification, boolean>,
}
