module SpaceMembershipService
  module Create
    class << self
      # @param api [DNAnexusAPI]
      # @param space [Space]
      # @param membership [SpaceMembership]
      def call(api, space, membership)
        invitee = membership.user.dxid
        org_dxid = space.org_dxid(membership)

        if ADMIN_USER != invitee || !admin_user_member?(api, org_dxid)
          attrs = {
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

          api.org_invite(org_dxid, invitee, attrs)
        end

        # add a new member to the space given
        space.space_memberships << membership

        # Skip adding to second space area when:
        #   space is of `groups` type or
        #   space is accepted (check in the Shared area only)
        return membership if !space.review? || space.shared? && !space.accepted?

        if space.confidential?
          # add a new member to the Shared space
          space.space.space_memberships << membership
        else
          # add a new member to a Private area of member side
          private_space = space.confidential_space(membership)
          private_space.space_memberships << membership if private_space
        end

        membership
      end

      def admin_user_member?(api, org_dxid)
        api.org_find_members(org_dxid, id: [ADMIN_USER])["results"].present?
      rescue StandardError
        false
      end
    end

    private_class_method :admin_user_member?
  end
end
