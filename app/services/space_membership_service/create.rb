module SpaceMembershipService
  module Create
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] membership
    def self.call(api, space, membership)
      invitee = membership.user.dxid
      org_dxid = space.org_dxid(membership)

      if ADMIN_USER != invitee || !admin_user_member?(api, org_dxid)
        attrs = {
          invitee: invitee,
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
      end

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

    def self.admin_user_member?(api, org_dxid)
      api.call(org_dxid, "findMembers", id: [ADMIN_USER])["results"].present?
    rescue
      false
    end
  end
end
