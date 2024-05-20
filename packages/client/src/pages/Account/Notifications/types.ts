export type ReviewerNotification =
  'reviewer_membership_changed' |
  'reviewer_comment_activity' |
  'reviewer_content_added_or_deleted'

export type SponsorNotification =
  'sponsor_membership_changed' |
  'sponsor_comment_activity' |
  'sponsor_content_added_or_deleted'

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

export type AllNotification = ReviewerNotification |
SponsorNotification |
ReviewerLeadNotification |
SponsorLeadNotification |
ReviewSpaceAdminNotification |
PrivateNotification

export type NotificationPreferencesPayload = Record<AllNotification, 1 | 0>

export type NotificationPreferences = {
  "reviewer": Record<ReviewerNotification, boolean>,
  "sponsor": Record<SponsorNotification, boolean>,
  "reviewer_lead": Record<ReviewerLeadNotification, boolean>,
  "sponsor_lead": Record<SponsorLeadNotification, boolean>,
  "admin": Record<ReviewSpaceAdminNotification, boolean>,
  "private": Record<PrivateNotification, boolean>,
}
