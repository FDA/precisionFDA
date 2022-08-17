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
  REVIEWER_KEYS = %i(
    reviewer_membership_changed
    reviewer_comment_activity
    reviewer_content_added_or_deleted
  ).freeze

  SPONSOR_KEYS = %i(
    sponsor_membership_changed
    sponsor_comment_activity
    sponsor_content_added_or_deleted
  ).freeze

  REVIEWER_LEAD_KEYS = %i(
    reviewer_lead_membership_changed
    reviewer_lead_comment_activity
    reviewer_lead_content_added_or_deleted
    reviewer_lead_member_added_to_space
    reviewer_lead_space_locked_unlocked_deleted
  ).freeze

  SPONSOR_LEAD_KEYS = %i(
    sponsor_lead_membership_changed
    sponsor_lead_comment_activity
    sponsor_lead_content_added_or_deleted
    sponsor_lead_member_added_to_space
    sponsor_lead_space_locked_unlocked_deleted
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
  # File - /https-apps-api/packages/shared/src/domain/email/email.config.ts
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
  }.freeze

  ALL_KEYS = REVIEWER_KEYS + SPONSOR_KEYS + REVIEWER_LEAD_KEYS + SPONSOR_LEAD_KEYS +
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
        reviewer_membership_changed: 0,
        reviewer_comment_activity: 1,
        reviewer_content_added_or_deleted: 0,
        sponsor_membership_changed: 0,
        sponsor_comment_activity: 1,
        sponsor_content_added_or_deleted: 0,
        reviewer_lead_membership_changed: 1,
        reviewer_lead_comment_activity: 1,
        reviewer_lead_content_added_or_deleted: 1,
        reviewer_lead_member_added_to_space: 1,
        reviewer_lead_space_locked_unlocked_deleted: 1,
        sponsor_lead_membership_changed: 1,
        sponsor_lead_comment_activity: 1,
        sponsor_lead_content_added_or_deleted: 1,
        sponsor_lead_member_added_to_space: 1,
        sponsor_lead_space_locked_unlocked_deleted: 1,
        admin_membership_changed: 1,
        admin_comment_activity: 1,
        admin_content_added_or_deleted: 1,
        admin_member_added_to_space: 1,
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
      reviewer: keys_list(REVIEWER_KEYS),
      sponsor: keys_list(SPONSOR_KEYS),
      reviewer_lead: keys_list(REVIEWER_LEAD_KEYS),
      sponsor_lead: keys_list(SPONSOR_LEAD_KEYS),
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
