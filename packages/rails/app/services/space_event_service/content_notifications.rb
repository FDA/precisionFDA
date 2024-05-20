module SpaceEventService
  class ContentNotifications
    class << self
      def send(event, nodejs_api_client)
        email_type_id = NotificationPreference.email_types[:notification_content]
        nodejs_api_client.email_send(email_type_id, { spaceEventId: event.id })
      end
    end
  end
end
