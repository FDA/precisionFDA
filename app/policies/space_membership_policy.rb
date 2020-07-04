# A class contains methods to determine permissions of different types
#   for space members
#
class SpaceMembershipPolicy
  class << self
    def can_run_apps?(space, membership)
      space.active? &&
        membership.present? &&
        membership.active? &&
        membership.lead_or_admin_or_contributor?
    end

    def can_move_content_by_user?(space, user)
      can_move_content?(
        space,
        space.space_memberships.find_by(user: user),
      )
    end

    # Check, whether space member can make actions with a space content, for ex. with a file.
    #   Actions could be one of: 'publish', 'delete' or 'copy_to_cooperative'.
    # @param space [Space] - space.
    # @param member [SpaceMembership] - an Object with a user data, who is space member.
    # @return [true or false] - depends upon: space, member and member's role.
    def can_move_content?(space, member)
      return false if space.restrict_to_template? && !space.shared?
      return false if member.blank?
      return false unless space.active?
      return false if member.new_record?
      return false if member.inactive?

      member.lead_or_admin_or_contributor?
    end

    def can_disable?(space, admin, member)
      suitable_admin_and_member?(space, admin, member)
    end

    def can_enable?(space, admin, member)
      suitable_admin_and_member?(space, admin, member, true)
    end

    def can_lead?(space, admin, member)
      suitable_admin_and_member?(space, admin, member)
    end

    def can_admin?(space, admin, member)
      return false unless suitable_admin_and_member?(space, admin, member)
      return false if member.admin?

      true
    end

    def can_contributor?(space, admin, member)
      return false unless suitable_admin_and_member?(space, admin, member)
      return false if member.contributor?

      true
    end

    def can_viewer?(space, admin, member)
      return false unless suitable_admin_and_member?(space, admin, member)
      return false if member.viewer?

      true
    end

    # Checks if a user can duplicate a space.
    # @param space [Space] A space.
    # @param membership [SpaceMembership] User membership in a space.
    # @return [Boolean] Returns true if user can duplicate a space, false otherwise.
    def can_duplicate?(space, membership)
      space.active? &&
        membership.present? &&
        membership.persisted? &&
        membership.review_space_admin?
    end

    # Checks if a user can accept a space.
    # @param space [Space] A space.
    # @param membership [SpaceMembership] User membership in a space.
    # @return [Boolean] Returns true if user can accept a space, false otherwise.
    def can_accept?(space, membership)
      membership.present? && membership.lead_or_admin? && !space.accepted_by?(membership)
    end

    alias_method :can_activate?, :can_accept?

    # Determine the possibility of role changing action.
    # @param space [Space] A space.
    # @param admin [SpaceMembership] Membership of a user who does role changing.
    # @param member [SpaceMembership] Membership of a user whos role is changing.
    # @param to_role [String] A new role of a user.
    # @return [Boolean] Returns true if admin can change a role of a member, false otherwise.
    def can_change_role?(space, admin, member, to_role)
      case to_role
      when SpaceMembership::ROLE_VIEWER
        can_viewer?(@pace, admin, member)
      when SpaceMembership::ROLE_CONTRIBUTOR
        can_contributor?(space, admin, member)
      when SpaceMembership::ROLE_ADMIN
        can_admin?(space, admin, member)
      when SpaceMembership::ROLE_LEAD
        can_lead?(space, admin, member)
      when SpaceMembership::DISABLE
        can_disable?(space, admin, member)
      when SpaceMembership::ENABLE
        can_enable?(space, admin, member)
      else
        raise "Unsupported role changing action: #{to_role}"
      end
    end

    private

    def suitable_admin_and_member?(_space, admin, member, for_enable = false)
      return false unless admin.lead_or_admin?

      if for_enable
        return false if member.active?
      elsif member.inactive?
        return false
      end

      return false if member.lead?

      admin.side == member.side
    end
  end
end
