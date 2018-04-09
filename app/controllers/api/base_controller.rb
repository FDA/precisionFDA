module Api
  class BaseController < ApplicationController

    skip_before_action :require_login
    before_action :require_api_login

    def update_active
      render json: {}, status: :no_content
    end

    def check_admin
      return if @context.can_administer_site?

      render json: { error: "You don't have permission for this" }.to_json, status: 403
    end

  end
end
