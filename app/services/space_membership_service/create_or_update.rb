module SpaceMembershipService
  module CreateOrUpdate
    # @param [String] target_role
    # @param [String] target_side
    # @param [SpaceMembership] admin_member
    def self.call(api, space, user, target_role, admin_member)
      membership = space.space_memberships.where(user_id: user.id).first_or_initialize
      membership.attributes = { role: target_role, side: admin_member.side }

      return if membership.lead?

      if membership.new_record?
        membership = SpaceMembershipService::Create.call(api, space, membership)
        create_event(space, membership, admin_member)
        membership
      else
        SpaceMembershipService::Update.call(api, space, membership) unless membership.lead?
      end
    end

    def self.create_event(space, member, admin_member)
      SpaceEventService.call(space.id, admin_member.user_id, admin_member, member, :membership_added)
    end

  end
end
