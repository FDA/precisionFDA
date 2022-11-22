module Api
  class BaseController < ApplicationController
    skip_before_action :require_login
    before_action :require_api_login

    def update_active
      render json: {}, status: :no_content
    end

    def check_admin
      return if @context.can_administer_site?

      render json: { error: "You don't have permission for this" }.to_json, status: 403
    end

    # Create a CLI auth key
    # Response:
    #   { "Key": "YOUR NEW AUTH KEY" }
    #
    # Note that Key is capitalized as this is expected by the CLI and can be used like this:
    #   echo '<RESPONSE_BODY>' > ~/.pfda_config
    def auth_key
      key = generate_auth_key
      render json: { Key: key }
    end
  end
end
