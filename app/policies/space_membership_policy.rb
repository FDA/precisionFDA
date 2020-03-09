# A class contains methods to determine permissions of different types
#   for space members
#
class SpaceMembershipPolicy
  class << self
    def can_modify_content?(space, item, user)
      can_move_content_by_user?(space, item, user)
    end

    def can_move_content_by_user?(space, item, user)
      owner = space.space_memberships.find_by(user_id: item.user_id)
      owner_side = owner.present? ? owner[:side] : SpaceMembership::SIDE_HOST

      can_move_content?(
        space,
        space.space_memberships.find_by(user_id: user.id),
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

    private

    attr_reader :admin

    def suitable_admin_and_member?(space, admin, member)
      return false unless admin.lead_or_admin?
      return false if member.inactive?
      return false if member.lead?

      admin.side == member.side
    end
  end
end
