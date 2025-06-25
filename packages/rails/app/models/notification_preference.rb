# == Schema Information
#
# Table name: notification_preferences
#
#  id      :integer          not null, primary key
#  user_id :integer
#  data    :text(65535)
#

# The current class is responsible only for storing user's preferences
#   (not the rights to receive a notification).
class NotificationPreference < ApplicationRecord
  GROUP_CONTRIBUTOR_KEYS = %i(
    group_contributor_membership_changed
    group_contributor_comment_activity
    group_contributor_content_added_or_deleted
  ).freeze

  SHARED_CONTRIBUTOR_KEYS = %i(
    shared_contributor_membership_changed
    shared_contributor_comment_activity
    shared_contributor_content_added_or_deleted
  ).freeze

  GROUP_VIEWER_KEYS = %i(
    group_viewer_membership_changed
    group_viewer_comment_activity
    group_viewer_content_added_or_deleted
  ).freeze

  SHARED_VIEWER_KEYS = %i(
    shared_viewer_membership_changed
    shared_viewer_comment_activity
    shared_viewer_content_added_or_deleted
  ).freeze

  GROUP_LEAD_KEYS = %i(
    group_lead_membership_changed
    group_lead_comment_activity
    group_lead_content_added_or_deleted
    group_lead_member_added_to_space
    group_lead_space_locked_unlocked_deleted
  ).freeze

  SHARED_LEAD_KEYS = %i(
    shared_lead_membership_changed
    shared_lead_comment_activity
    shared_lead_content_added_or_deleted
    shared_lead_member_added_to_space
    shared_lead_space_locked_unlocked_deleted
  ).freeze

  ADMIN_KEYS = %i(
    admin_membership_changed
    admin_comment_activity
    admin_content_added_or_deleted
    admin_member_added_to_space
    admin_space_locked_unlocked_deleted
  ).freeze

  PRIVATE_SCOPE_KEYS = %i(
    private_job_finished
    private_challenge_opened
    private_challenge_preregister
  ).freeze

  # email types currently handled by nodejs app
  # File - /server/libs/shared/src/domain/email/email.config.ts
  EMAIL_TYPES = {
    notification_job_done: 1,
    notification_content: 2,
    notification_space_membership: 3,
    notification_space_action: 4,
    notification_comment: 5,
    notification_challenge_opened: 6,
    notification_challenge_preregister: 7,
    # nodejs app only types
    # jobTerminationWarning = 8,
    # staleJobsReport = 9,
    notification_job_failed: 11,
    alert_message: 17,
    expert_question_added: 18,
    expert_added: 19,
    challenge_proposal_received: 20,
    license_request_email: 22,
    license_approved: 23,
    license_revoked: 24,
    space_activated: 25,
    space_activation: 26,
    invitation: 27,
    space_invitation: 28,
    node_copy: 29,
    user_provisioned: 30,
  }.freeze

  ALL_KEYS = GROUP_CONTRIBUTOR_KEYS + SHARED_CONTRIBUTOR_KEYS +
             GROUP_VIEWER_KEYS + SHARED_VIEWER_KEYS +
             GROUP_LEAD_KEYS + SHARED_LEAD_KEYS +
             ADMIN_KEYS + PRIVATE_SCOPE_KEYS

  ALL_KEYS.each do |key|
    define_method("#{key}=") do |value|
      super value.to_s == "1"
    end

    define_method("#{key}") do
      return true if super().nil?

      super()
    end
  end

  belongs_to :user

  validates(*ALL_KEYS, inclusion: { in: [true, false] })
  store :data, accessors: ALL_KEYS, coder: JSON

  class << self
    def default_preferences
      {
        # flags - enabled only for comment_activity
        # https://jira.internal.dnanexus.com/browse/PFDA-3094
        group_contributor_membership_changed: 0,
        group_contributor_comment_activity: 0,
        group_contributor_content_added_or_deleted: 0,
        shared_contributor_membership_changed: 0,
        shared_contributor_comment_activity: 0,
        shared_contributor_content_added_or_deleted: 0,
        group_viewer_membership_changed: 0,
        group_viewer_comment_activity: 0,
        group_viewer_content_added_or_deleted: 0,
        shared_viewer_membership_changed: 0,
        shared_viewer_comment_activity: 0,
        shared_viewer_content_added_or_deleted: 0,
        group_lead_membership_changed: 0,
        group_lead_comment_activity: 0,
        group_lead_content_added_or_deleted: 0,
        group_lead_member_added_to_space: 0,
        group_lead_space_locked_unlocked_deleted: 0,
        shared_lead_membership_changed: 0,
        shared_lead_comment_activity: 0,
        shared_lead_content_added_or_deleted: 0,
        shared_lead_member_added_to_space: 0,
        shared_lead_space_locked_unlocked_deleted: 0,
        admin_membership_changed: 0,
        admin_comment_activity: 0,
        admin_content_added_or_deleted: 0,
        admin_member_added_to_space: 0,
        admin_space_locked_unlocked_deleted: 1,
        private_job_finished: 0,
        private_challenge_opened: 1,
        private_challenge_preregister: 1,
      }
    end

    def create_for_user!(user)
      np = default_preferences
      np[:user_id] = user.id
      create!(np)
    end
  end

  def self.find_by_user(user)
    find_or_initialize_by(user_id: user.id)
  end

  def all_attributes
    {
      group_contributor: keys_list(GROUP_CONTRIBUTOR_KEYS),
      shared_contributor: keys_list(SHARED_CONTRIBUTOR_KEYS),
      group_viewer: keys_list(GROUP_VIEWER_KEYS),
      shared_viewer: keys_list(SHARED_VIEWER_KEYS),
      group_lead: keys_list(GROUP_LEAD_KEYS),
      shared_lead: keys_list(SHARED_LEAD_KEYS),
      admin: keys_list(ADMIN_KEYS),
      private: keys_list(PRIVATE_SCOPE_KEYS),
    }
  end

  def keys_list(keys)
    keys.each_with_object({}) do |key, memo|
      memo[key] = send(key)
    end
  end

  def available_keys
    ALL_KEYS
  end

  def self.email_types
    EMAIL_TYPES
  end
end
