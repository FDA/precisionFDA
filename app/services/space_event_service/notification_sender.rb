module SpaceEventService
  # Responsible for sending notifications.
  class NotificationSender
    CONTENT_TYPES = %w(
      file_added
      note_added
      app_added
      job_added
      asset_added
      comparison_added
      workflow_added
      file_deleted
      asset_deleted
    ).freeze

    COMMENT_TYPES = %w(comment_added).freeze

    MEMBERSHIP_TYPES = %w(
      membership_added
      membership_disabled
      membership_changed
      membership_enabled
    ).freeze

    SPACE_TYPES = %w(
      space_locked
      space_unlocked
      space_deleted
    ).freeze

    class << self
      def call(event, nodejs_api_client)
        notification_class(event).try(:send, event, nodejs_api_client)
      end

      private

      def notification_class(event)
        case event.activity_type
        when *CONTENT_TYPES    then SpaceEventService::ContentNotifications
        when *COMMENT_TYPES    then SpaceEventService::CommentNotifications
        when *SPACE_TYPES      then SpaceEventService::SpaceNotifications
        when *MEMBERSHIP_TYPES then SpaceEventService::MembershipNotifications
        end
      end
    end
  end
end
