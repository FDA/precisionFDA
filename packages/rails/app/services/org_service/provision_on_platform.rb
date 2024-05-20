module OrgService
  # Provides user and org on the platform.
  class ProvisionOnPlatform
    attr_reader :admin_api

    # Constructor.
    # @param admin_api [DNAnexusAPI] Admin API.
    # @param auth_api [DNAnexusAPI] Auth API.
    def initialize(admin_api, auth_api)
      @admin_api = admin_api
      @auth_api = auth_api
    end

    # rubocop:disable Metrics/MethodLength
    # Provides org and user on the platform.
    # @param org [String] Org's name.
    # @param username [String] User's name.
    # @param org_handle [String] Org's handle.
    # @param email [String] User's email.
    # @param first_name [String] User's first name.
    # @param last_name [String] User's last name.
    def call(org:, username:, org_handle:, email:, first_name:, last_name:)
      dxuserid = "user-#{username}"
      dxorg = Org.construct_dxorg(org_handle)
      dxorghandle = dxorg.sub(/^org-/, "")

      if @admin_api.entity_exists?(dxuserid)
        raise "We did not expect #{dxuserid} to exist on DNAnexus"
      end

      if Org.where(handle: org_handle).exists?
        raise "We did not expect org handle '#{org_handle}' to exist in the database"
      end

      if @admin_api.entity_exists?(dxorg)
        # Check if the org exists due to earlier failure
        org_description = @admin_api.org_describe(dxorg)

        if org_description["admins"] != [ADMIN_USER]
          raise "We found #{dxorg} to exist already and we are not the only admin"
        end

        if org_description["name"] != org
          raise "We found #{dxorg} to exist already but with a different name"
        end
      else
        @admin_api.org_new(dxorghandle, org)
      end

      @auth_api.org_update_billing_info(dxorg, BILLING_INFO, autoConfirm: BILLING_CONFIRMATION)

      @auth_api.user_new(username: username,
                         email: email,
                         first: first_name,
                         last: last_name,
                         billTo: ORG_EVERYONE)

      @admin_api.org_invite(dxorg, dxuserid,
                            level: DNAnexusAPI::ORG_MEMBERSHIP_ADMIN,
                            suppressEmailNotification: true)

      @admin_api.org_invite(ORG_EVERYONE, dxuserid,
                            level: DNAnexusAPI::ORG_MEMBERSHIP_MEMBER,
                            allowBillableActivities: false,
                            appAccess: true,
                            projectAccess: DNAnexusAPI::PROJECT_ACCESS_VIEW,
                            suppressEmailNotification: true)
    end
    # rubocop:enable Metrics/MethodLength
  end
end
