# Lightweight health check controller used by ECS container health checks.
# rubocop:disable Rails/ApplicationController
# Intentionally inherits from ActionController::Base instead of ApplicationController
# to bypass all app-level middleware filters (auth, session, audit, force_ssl redirect, etc.).
class HealthController < ActionController::Base
  ALLOWED_IPS = %w(127.0.0.1 ::1).freeze

  before_action :localhost_only

  def show
    render plain: "OK", status: :ok
  end

  private

  def localhost_only
    render plain: "Not Found", status: :not_found unless ALLOWED_IPS.include?(request.ip)
  end
end
# rubocop:enable Rails/ApplicationController
