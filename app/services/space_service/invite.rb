module SpaceService
  class Invite
    # @param [SpaceMembership] admin
    def self.call(api, space, admin, user, role)
      member = SpaceMembershipService::CreateOrUpdate.call(api, space, user, role, admin.side)
      SpaceEventService.call(space.id, admin.user_id, member, member, :membership_added) if space.review?
      NotificationsMailer.space_invitation_email(space, member, admin).deliver_now!
    end
  end
end
