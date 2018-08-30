module SpaceMembershipService
  module Update
    # @param [DNAnexusAPI] api
    # @param [Space] space
    # @param [SpaceMembership] membership
    def self.call(api, space, membership)
      return if membership.side_changed?

      org_dxid = space.org_dxid(membership)

      api.call(org_dxid, "setMemberAccess", membership.user.dxid => api_update_params(membership))

      membership.save!
      membership
    end

    # private

    def self.api_update_params(membership)
      if membership.inactive?
        { level: "MEMBER", allowBillableActivities: false, appAccess: false, projectAccess: "NONE" }
      elsif membership.lead_or_admin?
        { level: "ADMIN" }
      elsif membership.member?
        { level: "MEMBER", allowBillableActivities: false, appAccess: true, projectAccess: "CONTRIBUTE" }
      elsif membership.viewer?
        { level: "MEMBER", allowBillableActivities: false, appAccess: false, projectAccess: "VIEW" }
      end
    end

    private_class_method :api_update_params
  end
end
