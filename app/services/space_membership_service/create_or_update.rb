module SpaceMembershipService
  module CreateOrUpdate
    # @param [String] target_role
    # @param [String] target_side
    def self.call(api, space, user, target_role, target_side)
      membership = space.space_memberships.where(user_id: user.id).first_or_initialize
      membership.attributes = { role: target_role, side: target_side }

      return if membership.lead?

      if membership.new_record?
        SpaceMembershipService::Create.call(api, space, membership)
      else
        SpaceMembershipService::Update.call(api, space, membership) unless membership.lead?
      end
    end
  end
end
