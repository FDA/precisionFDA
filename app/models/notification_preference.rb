# The current class is responsible only for storing user's preferences
#   (not the rights to receive a notification).
class NotificationPreference < ActiveRecord::Base

  COMMON_KEYS = [
    :all_membership_changed,
    :all_new_task_assigned,
    :all_task_status_changed,
    :all_comment_activity, #mentioned in a comment, someone replies to their comment
    :all_content_added_or_deleted,
    # :all_app_or_workflow_status_changed, #job started, job completed, job failed, job terminated
  ]
  LEAD_KEYS = [
    :lead_membership_changed,
    :lead_new_task_assigned,
    :lead_task_status_changed,
    :lead_comment_activity, #mentioned in a comment, someone replies to their comment
    :lead_content_added_or_deleted,
    # :lead_app_or_workflow_status_changed, #job started, job completed, job failed, job terminated
    :lead_member_added_or_removed_from_space,
    :lead_space_locked_unlocked_deleted,
  ]
  ADMIN_KEYS = [
    :admin_membership_changed,
    :admin_new_task_assigned,
    :admin_task_status_changed,
    :admin_comment_activity, #mentioned in a comment, someone replies to their comment
    :admin_content_added_or_deleted,
    # :admin_app_or_workflow_status_changed, #job started, job completed, job failed, job terminated
    :admin_member_added_or_removed_from_space,
    :admin_space_locked_unlocked_deleted,
    :admin_space_lock_unlock_delete_requests,
  ]

  ALL_KEYS = COMMON_KEYS + LEAD_KEYS + ADMIN_KEYS

  ALL_KEYS.each do |key|
    define_method("#{key}=") do |value|
      super value.to_s == '1'
    end

    define_method("#{key}") do
      return true if super().nil?
      super()
    end
  end

  belongs_to :user

  validates *ALL_KEYS, inclusion: { in: [ true, false ] }
  store :data, accessors: ALL_KEYS, coder: JSON

  def self.find_by_user(user)
    find_or_initialize_by(user_id: user.id)
  end

  def all_attributes
    {
      review_space_admin: keys_list(ADMIN_KEYS),
      lead_reviewer: keys_list(LEAD_KEYS),
      reviewer: keys_list(COMMON_KEYS)
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
end
