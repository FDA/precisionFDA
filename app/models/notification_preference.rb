# The current class is responsible only for storing user's preferences
#   (not the rights to receive a notification).
class NotificationPreference < ActiveRecord::Base

  SPACE_COMMON_KEYS = [
    :membership_changed, #added to space, removed from space, role changed within space
    :task_assignment,
    :comment_activity, #mentioned in a comment, someone replies to their comment
    :content_added_or_deleted,
    # :app_workflow_status, #job started, job completed, job failed, job terminated
  ]
  SPACE_LEAD_AND_ADMIN_KEYS = [
    :space_lock_unlock_delete,
  ]
  ALL_KEYS = SPACE_COMMON_KEYS + SPACE_LEAD_AND_ADMIN_KEYS

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

  def self.find_by_user(user)
    find_or_initialize_by(user_id: user.id)
  end

  def attributes
    available_keys.each_with_object({}) do |key, memo|
      memo[key] = send(key)
    end
  end

  def available_keys
    if user.review_space_admin? || user.space_memberships.lead.active.any?
      ALL_KEYS
    else
      SPACE_COMMON_KEYS
    end
  end

end
