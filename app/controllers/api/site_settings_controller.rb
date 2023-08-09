module Api
  # Site Settings controller
  class SiteSettingsController < ApiController
    skip_before_action :require_api_login, only: %i(index)

    # Fetches all site settings
    def index
      response = https_apps_client.site_settings(request.headers["X-Forwarded-For"])
      render json: response
    end
  end
end
