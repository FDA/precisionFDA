module Api
  # Responsible for user-related information.
  class UsersController < BaseController
    def show
      render json: current_user, meta: meta, adapter: :json
    end

    private

    def meta
      @meta ||= { links: {} }.tap do |meta|
        meta[:links][:space_create] = api_spaces_path if current_user.can_create_spaces?
        meta[:links][:space_info] = info_api_spaces_path
        meta[:links][:accessible_spaces] = editable_spaces_api_spaces_path
        meta[:links][:accessible_apps] = api_list_apps_path
        meta[:links][:accessible_workflows] = api_list_workflows_path
        meta[:links][:accessible_files] = api_list_files_path
      end
    end
  end
end
