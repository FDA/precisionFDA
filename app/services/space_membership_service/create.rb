module SpaceMembershipService
  module Create
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] membership
    def self.call(api, space, membership)
      org_dxid = space.org_dxid(membership)

      api.call(org_dxid, "invite", {
        invitee: membership.user.dxid,
        level: membership.lead_or_admin? ? "ADMIN" : "MEMBER",
        suppressEmailNotification: true
      })

      space.space_memberships << membership

      return membership unless space.review?

      return membership unless space.accepted?

      if space.confidential?
        space.space.space_memberships << membership
      else
        private_space = space.confidential_space(membership)
        private_space.space_memberships << membership if private_space # initial leads
      end

      membership
    end
  end
end
