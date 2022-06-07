module SpaceEventService
  class SpaceNotifications
    class << self
      def send(event, nodejs_api_client)
        email_type_id = NotificationPreference.email_types[:notification_space_action]
        nodejs_api_client.email_send(email_type_id, {
          initUserId: event.user_id,
          spaceId: event.space_id,
          activityType: event.activity_type,
        })
      end
    end
  end
end
