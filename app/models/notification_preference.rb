# The current class is responsible only for storing user's preferences
#   (not the rights to receive a notification).
class NotificationPreference < ActiveRecord::Base

  SPACE_COMMON_KEYS = [
    :task_assignment,
    :task_status_change,
    :comment_activity,
    :comment_added_or_deleted,
  ]
  SPACE_LEAD_AND_ADMIN_KEYS = [
    :member_added_or_removed,
    :space_lock_unlock_delete,
  ]
  SPACE_ADMIN_KEYS = [:space_lock_unlock_delete_requests]
  ALL_KEYS = SPACE_COMMON_KEYS + SPACE_LEAD_AND_ADMIN_KEYS + SPACE_ADMIN_KEYS

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
  store :data, { accessors: ALL_KEYS, coder: JSON }

  def attributes
    available_keys.each_with_object({}) do |key, memo|
      memo[key] = send(key)
    end
  end

  def available_keys
    if user.review_space_admin?
      ALL_KEYS
    elsif user.space_memberships.lead.active.any?
      SPACE_LEAD_AND_ADMIN_KEYS + SPACE_COMMON_KEYS
    else
      SPACE_COMMON_KEYS
    end
  end

end
