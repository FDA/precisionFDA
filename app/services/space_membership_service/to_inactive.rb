module SpaceMembershipService
  module ToInactive
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] member
    # @param [SpaceMembership] admin_member
    def self.call(api, space, member, admin_member)
      return false unless member
      return false unless admin_member
      return false unless SpaceMembershipPolicy.can_disable?(space, admin_member, member)

      member.active = false

      SpaceMembershipService::Update.call(api, space, member)
    end
  end
end
