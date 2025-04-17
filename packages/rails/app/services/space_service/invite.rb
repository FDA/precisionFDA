module SpaceService
  class Invite
    # @param [SpaceMembership] admin
    def self.call(api, space, admin, user, role)
      membership = SpaceMembershipService::CreateOrUpdate.call(api, space, user, role, admin, true)

      https_apps_client = HttpsAppsClient.new
      https_apps_client.email_send(
        NotificationPreference.email_types[:space_invitation], [], membershipId: membership.id, adminId: admin.user_id
      )
      space_event = {
        spaceId: space.id,
        userId: user.id,
        activityType: 2, # newContentAdded
        entity: {
          type: "spaceMembership",
          value: {
            id: membership.id,
          },
        },
        ignoreUserIds: [user.id],
      }
      https_apps_client.create_and_send_space_event(space_event)
    end
  end
end
