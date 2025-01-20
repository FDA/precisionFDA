module SpaceService
  class Invite
    # @param [SpaceMembership] admin
    def self.call(api, space, admin, user, role)
      member = SpaceMembershipService::CreateOrUpdate.call(api, space, user, role, admin, true)
      if member
        https_apps_client = HttpsAppsClient.new
        https_apps_client.email_send(NotificationPreference.email_types[:space_invitation], [], { membershipId: member.id, adminId: admin.user_id }) # admin is user who created that membership
      end
    end
  end
end
