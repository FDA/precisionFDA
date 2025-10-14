module Rack
  # This middleware is used to capture the session cookie value after user logs in
  class CaptureSession
    def initialize(app)
      @app = app
    end

    def call(env)
      status, headers, body = @app.call(env)
      if env["PATH_INFO"] == "/return_from_login"
        user_id = env["rack.session"]["user_id"]
        session_cookie_key = Rails.application.config.session_options[:key]
        session_cookie_value = headers["Set-Cookie"]&.match(/#{session_cookie_key}=([^;]*)/).to_a[1]

        logger = ActiveSupport::TaggedLogging.new(Rails.logger)
        logger.tagged("user_id: #{user_id}") do
          post_login_checks("#{session_cookie_key}=#{session_cookie_value}") if session_cookie_value.present?
        end
      end

      [status, headers, body]
    end

    def post_login_checks(cookie_value)
      # User logged in successfully, a good time to run user checkup with the new token
      # N.B. We need to set RequestContext manually here because when return_from_login
      #      is called there is no valid session yet
      https_apps_client = HttpsAppsClient.new
      https_apps_client.user_checkup(cookie_value)
    rescue StandardError => e
      # Error in requesting a user checkup shouldn't interrupt the login process
      Rails.logger.error("Error requesting user checkup: #{e.message}")
    end
  end
end
