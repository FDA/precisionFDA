module SpaceEventService
  class CommentNotifications

    class << self

      def send(event)
        email_type_id = NotificationPreference.email_types[:notification_comment]
        api = DIContainer.resolve("https_apps_client")
        api.email_send(email_type_id, {
          spaceEventId: event.id,
        })
      end

    end

  end
end
