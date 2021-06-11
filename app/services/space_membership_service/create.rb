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

        space.space_memberships << membership

        return membership if !space.review? || !space.accepted?

        private_space = space.confidential_space(membership)

        private_space.space_memberships.create_with(
          membership.attributes.slice("meta", "role", "side"),
        ).find_or_create_by!(user: membership.user)
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
