module SpaceMembershipService
  # Enables space member.
  module ToEnable
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] member
    # @param [SpaceMembership] admin_member
    def self.call(api, space, member, admin_member)
      return false unless member
      return false unless admin_member
      return false unless SpaceMembershipPolicy.can_enable?(space, admin_member, member)

      member.active = true

      SpaceMembershipService::Update.call(api, space, member)
      create_event(space, member, admin_member)
    end

    def self.create_event(space, member, admin_member)
      SpaceEventService.call(
        space.id,
        admin_member.user_id,
        admin_member,
        member,
        :membership_enabled,
      )
    end
  end
end
