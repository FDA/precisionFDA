# The controller is used for proxying all GSRS requests.
class GinasController < ApplicationController
  include ReverseProxy::Controller

  skip_before_action :verify_authenticity_token

  GSRS_HEADER_USER_NAME =
    ENV.fetch("GSRS_AUTHENTICATION_HEADER_NAME", "AUTHENTICATION_HEADER_NAME")
  GSRS_HEADER_USER_EMAIL =
    ENV.fetch("GSRS_AUTHENTICATION_HEADER_NAME_EMAIL", "AUTHENTICATION_HEADER_NAME_EMAIL")
  GSRS_URL = ENV.fetch("GSRS_URL", "http://localhost:9000")

  def index
    reverse_proxy GSRS_URL,
                  path: request.fullpath,
                  headers: {
                    GSRS_HEADER_USER_NAME => current_user.full_name,
                    GSRS_HEADER_USER_EMAIL => current_user.email,
                  }
  end
end
