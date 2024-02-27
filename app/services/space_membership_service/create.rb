module SpaceMembershipService
  module Create
    class << self
      # @param api [DNAnexusAPI]
      # @param space [Space]
      # @param membership [SpaceMembership]
      # @param admin_member [User] - current user
      def call(api, space, membership, admin_member)
        new_user = membership.user
        invitee = new_user.dxid
        org_dxid = space.org_dxid(membership)
        reverse_org_dxid = space.opposite_org_dxid(membership)

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

          # To avoid invite yourself to an organization when user is RSA and
          # space is created and active already
          unless new_user.review_space_admin? && new_user.id == admin_member.id && space.state == Space::STATE_ACTIVE
            api.org_invite(org_dxid, invitee, attrs)
            # Members in group space need to be invited to both lead's groups
            invite_to_reverse_org(api, reverse_org_dxid, invitee, attrs) if space.groups?
          end
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

      def invite_to_reverse_org(api, reverse_org_dxid, invitee, attrs)
        api.org_invite(reverse_org_dxid, invitee, attrs)
      rescue StandardError => e
        # Log the error and continue
        Rails.logger.error "Failed to invite to reverse_org_dxid: #{e.message}"
        Rails.logger.error "This happens for legacy orgs where the leads were not invited to the reverse org when the org was created"
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
