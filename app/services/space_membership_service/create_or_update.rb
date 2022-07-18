module SpaceMembershipService
  module CreateOrUpdate
    # @param [String] target_role
    # @param [String] target_side
    # @param [SpaceMembership] admin_member
    # @param [Boolean] should_emit_event
    def self.call(api, space, user, target_role, admin_member, should_emit_event)
      # Note: should_emit_event is a workaround, implemented as part of bugfix, to prevent breaking changes
      membership = space.space_memberships.active.where(user_id: user.id).first_or_initialize
      membership.attributes = { role: target_role, side: admin_member.side }

      return if membership.lead?

      if membership.new_record?
        membership = SpaceMembershipService::Create.call(api, space, membership, admin_member.user)
        create_event(space, membership, admin_member) if should_emit_event
        membership
      else
        SpaceMembershipService::Update.call(api, space, membership) unless membership.lead?
      end
      membership
    end

    def self.create_event(space, member, admin_member)
      SpaceEventService.call(space.id, admin_member.user_id, admin_member, member, :membership_added)
    end
  end
end
