module IOC
  # IoC container implementation.
  class Container
    include Dry::Container::Mixin

    setting :token
    setting :user

    # Constructor.
    # @param token [String] User's token.
    # @param user [User] User to instantiate container for.
    def initialize(token, user)
      super()
      config[:token] = token
      config[:user] = user
      configure
    end

    private

    # Configures container by importing namespaces.
    def configure # rubocop:todo Metrics/MethodLength
      container = self

      register("https_apps_client") { HttpsAppsClient.new }

      namespace "api" do
        register("admin", memoize: true) { DNAnexusAPI.new(ADMIN_TOKEN) }
        register("challenge_bot", memoize: true) { DNAnexusAPI.new(CHALLENGE_BOT_TOKEN) }
        register("auth", memoize: true) { DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI) }
        register("auth_user") do
          DNAnexusAPI.new(config[:token], DNANEXUS_AUTHSERVER_URI)
        end
      end

      namespace "orgs" do # rubocop:todo Metrics/BlockLength
        register("user_removal_policy") { UserRemovalPolicy }
        register("member_removal_policy") { MemberRemovalPolicy }
        register("org_dissolve_policy") { OrgDissolvePolicy }

        register("leave_org_request_creator") do
          OrgService::LeaveOrgRequest.new(resolve("user_removal_policy"))
        end

        register("remove_member_request_creator") do
          OrgService::RemoveMemberRequest.new(resolve("member_removal_policy"))
        end

        register("dissolve_org_request_creator") do
          OrgService::DissolveOrgRequest.new(resolve("org_dissolve_policy"))
        end

        register("on_platform_provisioner") do
          OrgService::ProvisionOnPlatform.new(
            container.resolve("api.admin"),
            container.resolve("api.auth"),
          )
        end

        register("provisioner") do
          OrgService::Provision.new(resolve("on_platform_provisioner"))
        end

        register("admin_member_provisioner") do
          OrgService::ProvisionAdminOrgMember.new(
            container.resolve("api.admin"),
          )
        end
      end
    end
  end
end
