module SpaceMembershipService
  module Create
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] membership
    def self.call(api, space, membership)
      org_dxid = space.org_dxid(membership)

      attrs = {
        invitee: membership.user.dxid,
        level: "ADMIN",
        suppressEmailNotification: true,
      }

      unless membership.lead_or_admin?
        attrs.merge!(
          level: "MEMBER",
          projectAccess: membership.contributor? ? "CONTRIBUTE" : "VIEW",
          allowBillableActivities: false,
          appAccess: membership.contributor?,
        )
      end

      api.call(org_dxid, "invite", attrs)

      space.space_memberships << membership

      return membership if !space.review? || !space.accepted?

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
