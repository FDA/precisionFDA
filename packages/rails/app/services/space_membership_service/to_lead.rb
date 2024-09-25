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
        member.side = admin_member.side if member.side != admin_member.side
        SpaceMembershipService::Update.call(api, space, member)

        update_space_project_billing(space, member)

        if space.review?
          confidential_space = space.confidential_space(member)
          update_space_project_billing(confidential_space, member)
        end

        create_event(space, member, admin_member)
      end
    end

    def self.update_space_project_billing(space, member)
      project = space.project_dxid(member)
      admin_api = DIContainer.resolve("api.admin")
      admin_api.project_update(project, { billTo: member.user.billto })
    rescue StandardError => e
      # Possible failing cases:
      # 1. Project is already billed to the new lead's org. For example, transferring lead to other user
      # and transferring back. The update can be skipped in this case.
      # 2. Admin user is missing from the billable org, may be the legacy orgs. This can be removed
      # once we fix the admin user inconsistencies in PFDA-5666
      Rails.logger.error("Error when update project billing: space-#{space.id} - #{e.message}")
    end

    def self.create_event(space, member, admin_member)
      SpaceEventService.call(space.id, admin_member.user_id, admin_member, member, :membership_changed)
    end

    def self.update_current_lead(space, admin_member)
      return false unless admin_member

      lead = space.leads.where(side: admin_member[:side]).first
      lead.role = SpaceMembership::ROLE_ADMIN
      lead.save!
    end
  end
end
