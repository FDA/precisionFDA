module SpaceMembershipService
  module ToLead
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] member
    # @param [SpaceMembership] admin_member
    def self.call(api, space, member, admin_member)
      return false unless member
      return false unless admin_member
      return false unless SpaceMembershipPolicy.can_lead?(space, admin_member, member)

      ActiveRecord::Base.transaction do
        update_current_lead(space, admin_member)

        member.role = SpaceMembership::ROLE_LEAD
        SpaceMembershipService::Update.call(api, space, member)
        create_event(space, member, admin_member)
      end
    end

    def self.create_event(space, member, admin_member)
      SpaceEventService.call(space.id, admin_member.user_id, admin_member, member, :membership_changed)
    end

    def self.update_current_lead(space, admin_member)
      lead = space.leads.where(side: admin_member[:side]).first
      lead.role = SpaceMembership::ROLE_ADMIN
      lead.save!
    end
  end
end
