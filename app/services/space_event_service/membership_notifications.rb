module SpaceEventService
  class MembershipNotifications

    class << self

      def send(event)
        email_type_id = NotificationPreference.email_types[:notification_space_membership]
        api = DIContainer.resolve("https_apps_client")
        api.email_send(email_type_id, {
          initUserId: event.user_id,
          spaceId: event.space_id,
          updatedMembershipId: event.entity_id,
          activityType: event.activity_type,
          newMembershipRole: event.entity.role,
        })
      end

    end

  end
end
