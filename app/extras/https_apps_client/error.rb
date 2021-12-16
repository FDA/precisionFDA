class HttpsAppsClient
  # Client's specific error.
  class Error < StandardError
    DEFAULT_ERROR_MSG = "JupyterLab client error.".freeze
    DEFAULT_ERROR_CODE = "E_UNKNOWN".freeze
    SPACE_NOT_FOUND_ERROR_CODE = "E_SPACE_NOT_FOUND".freeze
    VALIDATION_ERROR_CODE = "E_VALIDATION".freeze

    def self.space_not_found_error_code
      SPACE_NOT_FOUND_ERROR_CODE
    end

    def initialize(msg)
      @msg = msg
    end

    def message
      @message ||= begin
        if @msg.is_a?(Net::HTTPResponse)
          if parsed_body[:code] == VALIDATION_ERROR_CODE
            props = parsed_body.dig(:props, :validationErrors, :body)[0]
            "#{props[:instancePath][1..]} #{props[:message]}"
          else
            parsed_body.dig(:props, :clientResponse, :error, :message) ||
              parsed_body[:message].presence ||
              DEFAULT_ERROR_MSG
          end
        else
          @msg
        end
      end
    end

    def code
      @code ||= @msg.is_a?(Net::HTTPResponse) && parsed_body[:code].presence || DEFAULT_ERROR_CODE
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
