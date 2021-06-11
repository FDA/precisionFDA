module SpaceEventService
  class ContentNotifications

    class << self

      def send(event)
        email_type_id = NotificationPreference.email_types[:notification_content]
        api = DIContainer.resolve("https_apps_client")
        api.email_send(email_type_id, {
          spaceEventId: event.id,
        })
      end

    end

  end
end
