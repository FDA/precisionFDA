module UserService
  # Creates four https apps projects for a user during a login.
  #   - jupyter_project
  #   - ttyd_project
  class HttpsAppsProjectsCreator
    PROJECT_NAMES = %w(
      jupyter_project
      ttyd_project
    ).freeze

    def initialize(api, user)
      @api = api
      @user = user
    end

    # Calls a process for creation https apps projects for a user.
    def call
      check_https_org_set!

      return unless https_org_member?

      updates =
        PROJECT_NAMES.each_with_object({}) do |project_name, memo|
          project_dxid = user[project_name]

          next if project_dxid && find_project(id: [project_dxid]).present?

          project = find_project(name: project_name) || create_project(project_name)
          memo[project_name] = project["id"]
        end

      user.update(updates)
    end

    private

    attr_reader :api, :user

    # Finds projects via DNAnexus API.
    # @param inputs [Hash] Inputs for /system/findProjects API call.
    # @return [Hash, nil] /system/findProjects call response.
    def find_project(inputs)
      api.system_find_projects(inputs.merge(limit: 1))["results"].first
    end

    # Creates project via DNAnexus API.
    # @param inputs [String] Project name.
    # @return [Hash] Created project.
    def create_project(project_name)
      api.project_new(project_name, billTo: ENV["HTTPS_APPS_BILL_TO"])
    end

    # Checks if current user is amember of https apps billable org.
    # @return [Boolean] Returns true if current user is a member, false otherwise.
    def https_org_member?
      api.system_find_orgs(
        id: [ENV["HTTPS_APPS_BILL_TO"]],
        level: DNAnexusAPI::ORG_MEMBERSHIP_MEMBER,
      )["results"].present?
    end

    # Checks if billable https org environment variable is set.
    # @raise [RuntimeError] if org is not set.
    def check_https_org_set!
      raise "HTTPS_APPS_BILL_TO environment variable is not set" if ENV["HTTPS_APPS_BILL_TO"].blank?
    end
  end
end
