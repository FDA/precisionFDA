module OrgService
  # Responsible user leaving organization process.
  class LeaveOrgProcess
    include OrgService::Errors

    # Constructor.
    # @param user_api [DNAnexusAPI] User API instance.
    # @param admin_api [DNAnexusAPI] Admin API instance.
    # @param auth_api [DNAnexusAPI] Auth server API instance.
    # @param policy [#satisfied?(org)] Policy responsible for user's membership.
    # @param orgname_generator [UnusedUsernameGenerator] Unused orgname generator.
    def initialize(user_api, admin_api, auth_api, policy, orgname_generator)
      @user_api = user_api
      @admin_api = admin_api
      @auth_api = auth_api
      @policy = policy
      @orgname_generator = orgname_generator

      @user = nil
      @old_org = nil
      @projects_old_names_map = nil
      @orgname = nil
    end

    # Responsible for entire process of leaving an organization by user.
    # @param org [Org] Organization user should leave.
    # @param user [User] User that should leave provided org.
    # @return [Hash] Mapping:
    #   1. between old and new projects,
    #   2. between old and new organizations.
    def call(org, user)
      @old_org = org
      @user = user
      @projects_old_names_map = nil
      @orgname = nil

      check_admin!
      check_membership!
      provide_new_org!
      invite_user_to_new_org!
      rename_projects!

      # Mapping should be built before database update since it replaces user's org.
      mapping = { projects: projects_map, organizations: org_map }

      update_database!

      mapping
    end

    private

    # Checks if user is admin and is the last survival in org
    # @raise [OrgService::Errors::AdminIsNotLastInOrgError] If user is admin and is not the last
    #   member in org.
    def check_admin!
      return if @user != @old_org.admin || @old_org.users.size == 1

      raise AdminIsNotLastInOrgError,
            "Can't remove admin from org '#{@old_org.name}' since he's not the last member"
    end

    # Checks if membership policy is satisfied.
    # @raise [RuntimeError] If policy is not satisfied.
    def check_membership!
      raise "User is not org member" unless @policy.satisfied?(@old_org, @user)
    end

    # Constructs and returns organization's handle.
    # @return [String] Handle of new organization.
    def orgname
      @orgname ||= begin
        base = User.construct_username(@user.first_name, @user.last_name)
        @orgname_generator.call(base)
      end
    end

    # Constructs and returns name of new organization.
    # @return [String] Name of new organization.
    def new_org_name
      "#{@user.first_name.upcase_first} #{@user.last_name.upcase_first}"
    end

    # Constructs and returns dxid of new organization.
    # @return [String] Dxid of new organization.
    def new_org_dxid
      Org.construct_dxorg(orgname)
    end

    # Constructs and returns handle of new organization.
    # @return [String] Handle of new organization.
    def new_org_handle
      new_org_dxid.sub(/^org-/, "")
    end

    # Returns mapping between projects' dxids and old names.
    # @return [Hash<String, String>] Keys are projects' dxids, values are corresponded name.
    def projects_old_names_map
      @projects_old_names_map ||= [
        @user.private_files_project,
        @user.private_comparisons_project,
        @user.public_files_project,
        @user.public_comparisons_project,
      ].each_with_object({}) do |dxid, memo|
        memo[dxid] = @user_api.project_describe(dxid)["name"]
        memo
      end
    end

    # Returns mapping between projects' dxids and new names.
    # @return [Hash] Keys are projects' dxids, values are corresponded name.
    def projects_new_names_map
      {
        @user.private_files_project => "precisionfda-personal-files-#{orgname}",
        @user.private_comparisons_project => "precisionfda-personal-comparisons-#{orgname}",
        @user.public_files_project => "precisionfda-public-files-#{orgname}",
        @user.public_comparisons_project => "precisionfda-public-comparisons-#{orgname}",
      }
    end

    # Represents mapping between user's corresponding old and new projects.
    # @return [Hash] Keys are projects types,
    #   values are hashes that represent mapping between old and new project names.
    def projects_map
      {
        private_files_project: {
          old: projects_old_names_map[@user.private_files_project],
          new: projects_new_names_map[@user.private_files_project],
        },
        private_comparisons_project: {
          old: projects_old_names_map[@user.private_comparisons_project],
          new: projects_new_names_map[@user.private_comparisons_project],

        },
        public_files_project: {
          old: projects_old_names_map[@user.public_files_project],
          new: projects_new_names_map[@user.public_files_project],
        },
        public_comparisons_project: {
          old: projects_old_names_map[@user.public_comparisons_project],
          new: projects_new_names_map[@user.public_comparisons_project],
        },
      }
    end

    # Returns mapping between old and new organizations.
    # @return [Hash] Keys are org properties,
    #   values are hashes that represent mapping between old and new property values.
    def org_map
      {
        dxid: {
          old: @user.org.dxid,
          new: new_org_dxid,
        },
        handle: {
          old: @user.org.handle,
          new: orgname,
        },
        name: {
          old: @user.org.name,
          new: new_org_name,
        },
      }
    end

    # Provides new organization.
    def provide_new_org!
      @admin_api.org_new(new_org_handle, new_org_name)

      @auth_api.org_update_billing_info(
        new_org_dxid,
        BILLING_INFO,
        autoConfirm: BILLING_CONFIRMATION,
      )
    end

    # Invites user into created organization as admin.
    def invite_user_to_new_org!
      @admin_api.org_invite(
        new_org_dxid,
        @user.dxid,
        level: DNAnexusAPI::ORG_MEMBERSHIP_ADMIN,
        suppressEmailNotification: true,
      )
    # TODO: Temporary fix, DXClient exceptions should be raised via reflection mechanism.
    rescue Net::HTTPClientException => e
      # Allow to proceed for case when SITE ADMIN leaves organization.
      raise e unless e.message =~ /Cannot invite yourself to an organization/
    end

    # Renames projects on the platform.
    def rename_projects!
      projects_new_names_map.each do |dxid, new_name|
        @user_api.project_update(dxid, name: new_name)
      end
    end

    # Triggers entities' update process.
    def update_database!
      ActiveRecord::Base.transaction do
        org = Org.create!(
          admin: @user,
          name: new_org_name,
          handle: orgname,
          singular: true,
          state: "complete",
        )

        @user.update!(org: org)
      end
    end
  end
end
