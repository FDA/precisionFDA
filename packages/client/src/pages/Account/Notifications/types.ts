export type ReviewerContributorNotification =
  'reviewer_contributor_membership_changed' |
  'reviewer_contributor_comment_activity' |
  'reviewer_contributor_content_added_or_deleted'

export type SponsorContributorNotification =
  'sponsor_contributor_membership_changed' |
  'sponsor_contributor_comment_activity' |
  'sponsor_contributor_content_added_or_deleted'

export type ReviewerViewerNotification =
  'reviewer_viewer_membership_changed' |
  'reviewer_viewer_comment_activity' |
  'reviewer_viewer_content_added_or_deleted'

export type SponsorViewerNotification =
  'sponsor_viewer_membership_changed' |
  'sponsor_viewer_comment_activity' |
  'sponsor_viewer_content_added_or_deleted'

export type ReviewerLeadNotification =
  'reviewer_lead_membership_changed' |
  'reviewer_lead_comment_activity' |
  'reviewer_lead_content_added_or_deleted' |
  'reviewer_lead_member_added_to_space' |
  'reviewer_lead_space_locked_unlocked_deleted'

export type SponsorLeadNotification =
  'sponsor_lead_membership_changed' |
  'sponsor_lead_comment_activity' |
  'sponsor_lead_content_added_or_deleted' |
  'sponsor_lead_member_added_to_space' |
  'sponsor_lead_space_locked_unlocked_deleted'

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

export type AllNotification = ReviewerContributorNotification |
  SponsorContributorNotification |
  ReviewerViewerNotification |
  SponsorViewerNotification |
  ReviewerLeadNotification |
  SponsorLeadNotification |
  ReviewSpaceAdminNotification |
  PrivateNotification

export type NotificationPreferencesPayload = Record<AllNotification, 1 | 0>

export type NotificationPreferences = {
  'reviewer_contributor': Record<ReviewerContributorNotification, boolean>,
  'sponsor_contributor': Record<SponsorContributorNotification, boolean>,
  'reviewer_viewer': Record<ReviewerViewerNotification, boolean>,
  'sponsor_viewer': Record<SponsorViewerNotification, boolean>,
  'reviewer_lead': Record<ReviewerLeadNotification, boolean>,
  'sponsor_lead': Record<SponsorLeadNotification, boolean>,
  'admin': Record<ReviewSpaceAdminNotification, boolean>,
  'private': Record<PrivateNotification, boolean>,
}
