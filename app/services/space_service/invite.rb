module SpaceService
  class Invite
    # @param [SpaceMembership] admin
    def self.call(api, space, admin, user, role)
      member = SpaceMembershipService::CreateOrUpdate.call(api, space, user, role, admin)
      NotificationsMailer.space_invitation_email(space, member, admin).deliver_now!
    end
  end
end
