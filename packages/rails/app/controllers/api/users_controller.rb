module Api
  # Responsible for user-related information.
  class UsersController < BaseController
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



    private

    def meta
      { session_id: }
    end

    def update_user_params
      params.require(:user).permit(:job_limit, :resources, :total_limit)
    end
  end
end
