module SpaceEventService
  class MembershipNotifications
    class << self
      def send(event, nodejs_api_client)
        email_type_id = NotificationPreference.email_types[:notification_space_membership]

        nodejs_api_client.email_send(email_type_id, {
          initUserId: event.user_id,
          spaceId: event.space_id,
          updatedMembershipId: event.entity_id,
          activityType: event.activity_type,
          newMembershipRole: event.entity.role,
        })
      rescue HttpsAppsClient::Error => e
        raise e unless e.code == HttpsAppsClient::Error::SPACE_NOT_FOUND_ERROR_CODE

        {}
      end
    end
  end
end
