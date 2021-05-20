module SpaceEventService
  class SpaceNotifications

    class << self

      def send(event)
        email_type_id = NotificationPreference.email_types[:notification_space_action]
        api = DIContainer.resolve("https_apps_client")
        api.email_send(email_type_id, {
          initUserId: event.user_id,
          spaceId: event.space_id,
          activityType: event.activity_type,
        })
      end

    end

  end
end
