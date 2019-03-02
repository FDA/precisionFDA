module SpaceEventService
  class NotificationSender

    TASK_TYPES = %w(task_created task_reassigned task_completed task_declined task_deleted)
    CONTENT_TYPES = %w(file_added note_added app_added job_added asset_added comparison_added workflow_added)
    COMMENT_TYPES = %w(comment_added)
    MEMBERSHIP_TYPES = %w(membership_added membership_disabled membership_changed)
    SPACE_TYPES = %w(space_locked space_unlocked space_deleted)

    class << self
      def call(event)
        notification_class(event).try(:send, event)
      end

      private

      def notification_class(event)
        case event.activity_type
        when *TASK_TYPES       then SpaceEventService::TaskNotifications
        when *CONTENT_TYPES    then SpaceEventService::ContentNotifications
        when *COMMENT_TYPES    then SpaceEventService::CommentNotifications
        when *SPACE_TYPES      then SpaceEventService::SpaceNotifications
        when *MEMBERSHIP_TYPES then SpaceEventService::MembershipNotifications
        end
      end
    end

  end
end
