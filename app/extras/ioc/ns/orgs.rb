module IOC
  module NS
    Orgs = Dry::Container::Namespace.new("orgs") do
      import API

      register("user_removal_policy") { UserRemovalPolicy }
      register("member_removal_policy") { MemberRemovalPolicy }
      register("org_dissolve_policy") { OrgDissolvePolicy }

      register("unused_orgname_generator") do
        UnusedOrgnameGenerator.new(resolve("api.user"))
      end

      register("org_leave_processor") do
        OrgService::LeaveOrgProcess.new(
          resolve("api.user"),
          resolve("api.admin"),
          resolve("api.auth"),
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
          resolve("api.admin"),
          resolve("api.auth"),
        )
      end

      register("provisioner") do
        OrgService::Provision.new(resolve("on_platform_provisioner"))
      end
    end
  end
end
