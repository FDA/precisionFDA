# The controller is used for proxying GSRS requests which do not request authorization
class GinasUnauthorizedController < ApplicationController
  include ReverseProxy::Controller

  GSRS_URL = ENV.fetch("GSRS_URL", "http://localhost:8080")
  BETA_ROUTES = %w(
    /ginas/app
    /ginas/app/styles.+\.css # fixme: Remove this hack, see PFDA-2815
    /ginas/app/webjars/.+
    /ginas/app/assets/.+
    /ginas/app/lock
    /ginas/app/register
    /ginas/app/structure
    /ginas/app/structureSearch
    /ginas/app/sequence
    /ginas/app/wizard
    /ginas/app/structureSearch
    /ginas/app/substance
    /ginas/app/substance/.+
    /ginas/app/substances
    /ginas/app/load
    /ginas/app/loadSDF
    /ginas/app/loadSDF/.+
    /ginas/app/monitor
    /ginas/app/monitor/.+
    /ginas/app/relationships/[^\/]+
    /ginas/app/cv
    /ginas/app/cv/.+
    /ginas/app/_updateIndex
    /ginas/app/_updateIndex/.+
    /ginas/app/admin
    /ginas/app/admin/.+
    /ginas/app/profile
    /ginas/app/myDownloads
    /ginas/app/myDownloads/.+
  ).freeze

  skip_before_action :require_login
  before_action :beta_redirect, if: -> { beta_redirectable? }

  def csrf_token
    render(plain: form_authenticity_token)
  end

  def index
    headers = {}
    unless current_user.nil?
      headers = {
        AUTHENTICATION_USERNAME: current_user.username,
        AUTHENTICATION_EMAIL: current_user.email,
      }
    end

    reverse_proxy GSRS_URL,
                  path: request.fullpath,
                  headers: headers do |config|
      config.on_error do |code, response|
        logger.error "Received GSRS error for path #{request.fullpath}: #{response.body}, code: #{code}"
      end
    end
  end

  def skip_request
    head :ok
  end

  private

  def beta_redirect
    modified_path = request.fullpath.sub("/ginas/app", "/ginas/app/beta")
    safe_modified_path = CGI.escape(modified_path)

    redirect_to safe_modified_path
  end

  def beta_redirectable?
    BETA_ROUTES.find { |route| Regexp.new("^#{route}$") =~ request.path.chomp("/") }
  end
end
