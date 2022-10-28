module Api
  # Site Settings controller
  class SiteSettingsController < ApiController
    skip_before_action :require_api_login, only: %i(sso_button)

    # Fetches sso button site setting from node js api a.k.a. https apps api
    def sso_button
      response = https_apps_client.site_settings_sso_button(request.headers["X-Forwarded-For"])
      render json: response
    end

    def cdmh
      response = https_apps_client.site_settings_cdmh(request.headers["X-Forwarded-For"])
      render json: response
    end
  end
end
