module Api
  # Discussions API controller.
  class DiscussionsController < ApiController
    include Paginationable
    include Sanitizable

    before_action :require_login

    # GET /api/discussions/:id/describe
    # used by CLI - keep this for older version before deprecation.
    def describe
      response = https_apps_client.cli_discussion_describe(params[:id])
      render json: response, adapter: :json
    end

  end
end
