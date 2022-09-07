# The controller is used for proxying all GSRS requests.
class GinasController < ApplicationController
  include ReverseProxy::Controller

  GSRS_DEFAULT_URL = "http://localhost:9000".freeze
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

  skip_before_action :verify_authenticity_token
  before_action :beta_redirect, if: -> { beta_redirectable? }

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
    rescue StandardError
      msg = "Can't create a substance file for #{current_user.full_name}"
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
    redirect_to request.fullpath.sub("/ginas/app", "/ginas/app/beta")
  end

  def beta_redirectable?
    BETA_ROUTES.find { |route| Regexp.new("^#{route}$") =~ request.path.chomp("/") }
  end
end
