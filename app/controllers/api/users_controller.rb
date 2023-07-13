module Api
  # Responsible for user-related information.
  class UsersController < BaseController
    skip_before_action :require_api_login, only: :show
    before_action :require_api_login_or_guest, only: :show

    before_action :check_admin, only: %i(update)

    def show
      render json: current_user, meta:, adapter: :json
    end

    def update
      user = User.find(params[:id])
      user.update(update_user_params)

      render json: user, adapter: :json
    end

    def cloud_resources
      api = DNAnexusAPI.new(RequestContext.instance.token)

      resources = Users::ChargesFetcher.fetch(api, current_user)

      resources[:usageLimit] = current_user.total_limit
      resources[:jobLimit] = current_user.job_limit
      resources[:usageAvailable] = [resources[:usageLimit] - resources[:totalCharges], 0].max

      render json: resources
    end

    def active
      active_users = https_apps_client.active_users
      render json: active_users
    end

    def government
      government_users = https_apps_client.government_users
      render json: government_users
    end

    private

    def meta
      links = { links: {} }

      return links if @context.guest?

      links.tap do |meta|
        meta[:links][:space_create] = api_spaces_path
        meta[:links][:space_info] = info_api_spaces_path
        meta[:links][:accessible_spaces] = editable_spaces_api_spaces_path
        meta[:links][:accessible_apps] = api_list_apps_path
        meta[:links][:accessible_workflows] = api_list_workflows_path
        meta[:links][:accessible_files] = api_list_files_path
        meta[:links][:challenge_new] = new_challenge_path if current_user.can_create_challenges?
      end.merge({ session_id: })
    end

    def update_user_params
      params.require(:user).permit(:job_limit, :resources, :total_limit)
    end
  end
end
