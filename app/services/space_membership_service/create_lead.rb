module SpaceMembershipService
  module CreateLead
    # @param [String] target_side
    def self.call(api, space, user, target_side)
      membership = space.space_memberships.lead.new(
        user_id: user.id,
        side: target_side
      )

      SpaceMembershipService::Create.call(api, space, membership)
    end
  end
end
