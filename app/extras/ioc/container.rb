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
    def configure
      container = self

      register("docker_exporter") do
        DockerExporter.new(
          container.resolve("api.user"),
          Rails.application.routes.url_helpers,
          )
      end

      namespace "api" do
        register("user", memoize: true) { DNAnexusAPI.new(config[:token]) }
        register("admin", memoize: true) { DNAnexusAPI.new(ADMIN_TOKEN) }
        register("auth", memoize: true) { DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI) }
      end

      namespace "orgs" do
        register("user_removal_policy") { UserRemovalPolicy }
        register("member_removal_policy") { MemberRemovalPolicy }
        register("org_dissolve_policy") { OrgDissolvePolicy }

        register("unused_orgname_generator") do
          UnusedOrgnameGenerator.new(container.resolve("api.user"))
        end

        register("org_leave_processor") do
          OrgService::LeaveOrgProcess.new(
            container.resolve("api.user"),
            container.resolve("api.admin"),
            container.resolve("api.auth"),
            resolve("user_removal_policy"),
            resolve("unused_orgname_generator"),
          )
        end

        register("login_tasks_processor") do
          LoginTasksProcessor.new(resolve("org_leave_processor"))
        end

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
      end

      namespace("comparisons") do
        namespace "sync" do
          register("updater") { SyncService::Comparisons::ComparisonUpdater }

          register("filter") { SyncService::Comparisons::ComparisonsFilter }

          register("state_processor") do
            SyncService::Comparisons::StateProcessor.new(
              container.resolve("api.user"),
            )
          end

          register("comparison_processor") do
            SyncService::Comparisons::ComparisonProcessor.new(
              resolve("state_processor"),
              resolve("updater"),
            )
          end

          register("synchronizer") do
            SyncService::Comparisons::Synchronizer.new(
              container.resolve("api.user"),
              resolve("filter"),
              resolve("comparison_processor"),
            )
          end
        end
      end
    end
  end
end
