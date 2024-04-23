module SpaceMembershipService
  module Update
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] membership
    def self.call(api, space, membership)
      return if membership.side_changed?

      org_dxid = space.org_dxid(membership)

      api.call(org_dxid, "setMemberAccess", membership.user.dxid => api_update_params(membership))

      if space.groups?
        begin
          reverse_org_dxid = space.opposite_org_dxid(membership)
          api.call(reverse_org_dxid, "setMemberAccess", membership.user.dxid => api_update_params(membership))
        rescue StandardError => e
          # Log the error and continue
          Rails.logger.error "Failed to invite to reverse_org_dxid: #{e.message}"
          Rails.logger.error "This happens for legacy orgs where the leads were not invited to the reverse org when the org was created"
        end
      end

      membership.save!
      membership
    end

    # private

    def self.api_update_params(membership)
      if membership.inactive?
        { level: "MEMBER", allowBillableActivities: false, appAccess: false, projectAccess: "NONE" }
      elsif membership.lead_or_admin?
        { level: "ADMIN" }
      elsif membership.contributor?
        { level: "MEMBER", allowBillableActivities: false, appAccess: true, projectAccess: "CONTRIBUTE" }
      elsif membership.viewer?
        { level: "MEMBER", allowBillableActivities: false, appAccess: false, projectAccess: "VIEW" }
      end
    end

    private_class_method :api_update_params
  end
end
