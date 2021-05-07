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

      private

      def action(event)
        event.activity_type.to_s.split("_").last
      end

      def receivers(event)
        User.joins(:space_memberships).merge(event.entity.space_object.space_memberships.active).select do |user|
          next if user.id == event.user_id
          notification_preference_by_role(event, user)
        end
      end

      def notification_preference_by_role(event, user)
        notification_preference = NotificationPreference.find_by_user(user)
        role = event.space.space_memberships.find_by_user_id(user.id).role
        role = "all" unless ["admin", "lead"].include?(role)
        admin_preference = rsa?(role, user) ? "admin_content_added_or_deleted" : nil
        preference = "#{role}_content_added_or_deleted"
        if admin_preference
          notification_preference.send(preference) || notification_preference.send(admin_preference)
        else
          notification_preference.send(preference)
        end
      end

      def rsa?(role, user)
        role != "admin" && user.review_space_admin?
      end

    end

  end
end
