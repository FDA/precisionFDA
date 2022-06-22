module SpaceMembershipService
  module CreateLead
    # @param [String] target_side
    def self.call(api, space, user, target_side, admin_member)
      membership = space.space_memberships.lead.new(
        user_id: user.id,
        side: target_side
      )

      SpaceMembershipService::Create.call(api, space, membership, admin_member)
    end
  end
end
