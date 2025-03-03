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
    # This is a temporal solution, specifically implemented to go around this very GSRS code change:
    # https://github.com/ncats/gsrs-spring-starter/blame/06a1b6f1c1aeb3f379e6e944fc7a7c4549b4f3ce/gsrs-spring-boot-autoconfigure/src/main/java/gsrs/controller/AbstractGsrsEntityController.java#L175
    # It was agreed on the authentication should not be necessary, so once the endpoint becomes public,
    # this "pfda-guest" authentication header is not necessary anymore.
    # Note: there is no meaning behind the used email address.
    headers = {
      AUTHENTICATION_USERNAME: "pfda-guest",
      AUTHENTICATION_EMAIL: "pfda-guest@5832cb59-c313-4b28-b308-677980604c2a.com",
    }
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

  # Reverse proxy for importing substances from URL
  def json_reverse_proxy
    raw_query = request.query_string
    url = raw_query.match(/(?:^|&|\?)url=([^&]*)/)&.captures&.first

    if url.blank?
      render status: :bad_request, json: { message: "URL param is empty" }
      return
    end

    begin
      uri = URI(url)
      response = Net::HTTP.get_response(uri)
    rescue StandardError => e
      logger.warn "Error while loading '#{url}'; #{e.message}"
      render status: :bad_request, json: { message: "Could not load given URL" }
      return
    end

    if response.is_a?(Net::HTTPSuccess)
      if valid_json?(response.body)
        render json: response.body
      else
        logger.warn "The URL '#{url}' was loaded, but does not contain valid JSON"
        render status: :bad_request, json: { message: "The URL was loaded, but does not contain valid JSON" }
      end
    else
      logger.warn "Error while loading '#{url}'; status #{response.code}"
      render status: :bad_request, json: { message: "Could not load given URL" }
    end
  end

  private

  def valid_json?(input)
    JSON.parse(input)
    true
  rescue JSON::ParserError, TypeError => e
    false
  end

  def beta_redirect
    modified_path = request.fullpath.sub("/ginas/app", "/ginas/app/ui")
    safe_modified_path = CGI.escape(modified_path)

    redirect_to safe_modified_path
  end

  def beta_redirectable?
    BETA_ROUTES.find { |route| Regexp.new("^#{route}$") =~ request.path.chomp("/") }
  end
end
