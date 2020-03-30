module OrgService
  # Adds a user to precisionFDA admins org on the platform.
  class ProvisionAdminOrgMember
    attr_reader :admin_api

    # Constructor.
    # @param admin_api [DNAnexusAPI] Admin API.
    def initialize(admin_api)
      @admin_api = admin_api
    end

    # Adds user to admin_org on the platform.
    # @param dxid [String] User's dxid (ex: user-xxxx).
    def call(dxid)
      @admin_api.org_invite(PFDA_ADMIN_ORG, dxid,
                            level: DNAnexusAPI::ORG_MEMBERSHIP_MEMBER,
                            allowBillableActivities: false,
                            appAccess: true,
                            projectAccess: DNAnexusAPI::PROJECT_ACCESS_VIEW,
                            suppressEmailNotification: true)
    end
  end
end
