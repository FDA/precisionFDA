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

  skip_before_action :verify_authenticity_token
  before_action :create_substances_file, if: -> { substance_submit_request? }

  def index
    reverse_proxy GSRS_URL,
                  path: request.fullpath,
                  headers: {
                    GSRS_HEADER_USER_NAME => current_user.full_name,
                    GSRS_HEADER_USER_EMAIL => current_user.email,
                  } do |config|
                    config.on_response do |_code, response|
                      if substance_submit_request?
                        data = JSON.parse(response.body)
                        response.body = data.merge(fileUrl: @file_url).to_json
                      end
                    end
                  end
  end

  private

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
