# The controller is used for proxying all GSRS requests.
class GinasController < ApplicationController
  include ReverseProxy::Controller

  GSRS_DEFAULT_URL = "http://localhost:8080".freeze
  GSRS_HEADER_USER_NAME =
    ENV.fetch("GSRS_AUTHENTICATION_HEADER_NAME", "AUTHENTICATION_HEADER_NAME")
  GSRS_HEADER_USER_EMAIL =
    ENV.fetch("GSRS_AUTHENTICATION_HEADER_NAME_EMAIL", "AUTHENTICATION_HEADER_NAME_EMAIL")
  GSRS_URL = ENV.fetch("GSRS_URL", GSRS_DEFAULT_URL)
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

  before_action :beta_redirect, if: -> { beta_redirectable? }

  # Add pfda CSRF token to HTML response
  after_action :add_ruby_csrf_token
  def add_ruby_csrf_token
    return unless media_type == "text/html" && @_response_body[0].exclude?("csrf-token")

    @_response_body[0] = @_response_body[0].sub("<head>", "<head><meta name=\"csrf-token\" content=\"#{form_authenticity_token}\">")
  end

  def index
    reverse_proxy GSRS_URL,
                  path: request.fullpath,
                  headers: {
                    GSRS_HEADER_USER_NAME => current_user.username,
                    GSRS_HEADER_USER_EMAIL => current_user.email,
                  } do |config|
                    config.on_error do |code, response|
                      logger.error "Received GSRS error for path #{request.fullpath}: " \
                                   "#{response.body}, code: #{code}"
                    end
                  end
  end

  def substances
    substance_creator = Ginas::SubstanceFileCreator.new(@context)

    begin
      file = substance_creator.create_and_upload_file(request)
    rescue StandardError => e
      msg = "Can't create a substance file for #{current_user.dxuser}, encountered: #{e}"
      logger.error msg
      render(plain: msg, status: :unprocessable_entity) && return
    end

    render json: { fileUrl: "#{HOST}/home/files/#{file.uid}" }
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
