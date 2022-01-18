class HttpsAppsClient
  # Client's specific error.
  class Error < StandardError
    DEFAULT_ERROR_MSG = "nodejs-api client error.".freeze
    DEFAULT_ERROR_CODE = "E_UNKNOWN".freeze
    SPACE_NOT_FOUND_ERROR_CODE = "E_SPACE_NOT_FOUND".freeze
    VALIDATION_ERROR_CODE = "E_VALIDATION".freeze

    def initialize(msg)
      @msg = msg
    end

    def message
      @message ||= begin
        if @msg.is_a?(Net::HTTPResponse)
          if code == VALIDATION_ERROR_CODE
            error_body = parsed_body.dig(:error, :validationErrors, :body)[0]
            "#{error_body[:instancePath][1..]} #{error_body[:message]}"
          else
            parsed_body.dig(:error, :clientResponse, :error, :message) ||
              parsed_body.dig(:error, :message).presence ||
              DEFAULT_ERROR_MSG
          end
        else
          @msg
        end
      end
    end

    def code
      @code ||= (
        @msg.is_a?(Net::HTTPResponse) &&
        parsed_body.dig(:error, :code).presence
      ) || DEFAULT_ERROR_CODE
    end

    alias_method :error_code, :code

    private

    def parsed_body
      @parsed_body ||= begin
        begin
          JSON.parse(@msg.try(:body) || "").with_indifferent_access
        rescue JSON::ParserError
          {}
        end
      end
    end
  end
end
