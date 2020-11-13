module UserService
  # Creates four https apps projects for a user during a login.
  #   - jupyter_project
  #   - ttyd_project
  #   - cloud_workstation_project
  #   - https_project
  class HttpsAppsProjectsCreator
    PROJECT_NAMES = %w(
      jupyter_project
      ttyd_project
      cloud_workstation_project
      https_project
    ).freeze

    def initialize(api, user)
      @api = api
      @user = user
    end

    # Calls a process for creation https apps projects for a user.
    def call
      updates =
        PROJECT_NAMES.reduce({}) do |result, project_name|
          project_dxid = user[project_name]

          if (project_dxid && find_project(id: project_dxid)).blank?
            project = find_project(name: project_name) || create_project(project_name)
            result[project_name] = project["id"]
          end

          result
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
      api.project_new(project_name)
    end
  end
end
