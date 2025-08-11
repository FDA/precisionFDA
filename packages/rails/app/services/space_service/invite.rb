module SpaceService
  class Invite
    # @param [SpaceMembership] admin
    def self.call(api, space, admin, user, role)
      membership = SpaceMembershipService::CreateOrUpdate.call(api, space, user, role, admin, true)

      https_apps_client = HttpsAppsClient.new
      https_apps_client.email_send(
        NotificationPreference.email_types[:space_invitation], { membershipId: membership.id, adminId: admin.user_id }
      )
    end
  end
end
