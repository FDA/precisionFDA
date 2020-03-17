module OrgService
  # Provides user and org on the platform.
  class ProvisionAdminOrgMember
    attr_reader :admin_api

    # Constructor.
    # @param admin_api [DNAnexusAPI] Admin API.
    def initialize(admin_api)
      @admin_api = admin_api
    end

    # rubocop:disable Metrics/MethodLength
    # Adds user to admin_org on the platform.
    # @param username [String] User's name.
    def call(username)

      dxuserid = "user-#{username}"

      @admin_api.org_invite(PFDA_ADMIN_ORG, dxuserid,
                            level: DNAnexusAPI::ORG_MEMBERSHIP_MEMBER,
                            allowBillableActivities: false,
                            appAccess: true,
                            projectAccess: DNAnexusAPI::PROJECT_ACCESS_VIEW,
                            suppressEmailNotification: true)
    end
    # rubocop:enable Metrics/MethodLength
  end
end
