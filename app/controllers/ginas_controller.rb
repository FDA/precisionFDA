# The controller is used for proxying all GSRS requests.
class GinasController < ApplicationController
  include ReverseProxy::Controller

  GSRS_DEFAULT_URL = "http://localhost:9000".freeze
  GSRS_HEADER_USER_NAME =
    ENV.fetch("GSRS_AUTHENTICATION_HEADER_NAME", "AUTHENTICATION_HEADER_NAME")
  GSRS_HEADER_USER_EMAIL =
    ENV.fetch("GSRS_AUTHENTICATION_HEADER_NAME_EMAIL", "AUTHENTICATION_HEADER_NAME_EMAIL")
  GSRS_URL = ENV.fetch("GSRS_URL", GSRS_DEFAULT_URL)
  SUBSTANCES_PATH = "/ginas/app/api/v1/substances".freeze
  BETA_ROUTES = %w(
    /ginas/app
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
  before_action :create_substances_file, if: -> { substance_submit_request? }

  def index
    reverse_proxy GSRS_URL,
                  path: request.fullpath,
                  headers: {
                    GSRS_HEADER_USER_NAME => current_user.username,
                    GSRS_HEADER_USER_EMAIL => current_user.email,
                  } do |config|
                    config.on_response do |code, response|
                      if response.is_a? Net::HTTPSuccess
                        if substance_submit_request?
                          data = JSON.parse(response.body)
                          response.body = data.merge(fileUrl: @file_url).to_json
                        end
                      else
                        logger.info("Received GSRS error for path #{request.fullpath}" \
                          ", code: #{code}")
                      end
                    end
                  end
  end

  private

  def beta_redirect
    redirect_to request.fullpath.sub("/ginas/app", "/ginas/app/beta")
  end

  def beta_redirectable?
    BETA_ROUTES.find { |route| Regexp.new("^#{route}$") =~ request.path.chomp("/") }
  end

  def create_substances_file
    substance_creator = Ginas::SubstanceFileCreator.new(@context)
    file = substance_creator.create_and_upload_file(request)
    @file_url = "#{HOST}/home/files/#{file.uid}"
  rescue StandardError => e
    logger.error "Can't create a substance file for user #{current_user.dxuser}"
    logger.error e.message
  end

  def substance_submit_request?
    allowed_methods = [Net::HTTP::Post::METHOD, Net::HTTP::Put::METHOD]
    request.path == SUBSTANCES_PATH && allowed_methods.include?(request.method)
  end
end
