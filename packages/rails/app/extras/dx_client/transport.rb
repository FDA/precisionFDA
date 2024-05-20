module DXClient
  # Responsible for building requests and communication with API server.
  class Transport
    # @param token [String] API token.
    # @param api_server [String] API server to send requests to.
    def initialize(token, api_server)
      @token = token
      @api_server = api_server
    end

    # Builds request, sends it to API server and returns the response.
    # @param subject [String] Subject to invoke on.
    # @param method [String] Method to invoke on subject.
    # @param body [Hash] HTTP POST body.
    # @return [Hash] The response from API server.
    def call(subject, method, body = {}, extra_headers = {})
      uri = URI("#{@api_server}#{subject}/#{method}")
      conn_opts = connection_opts.merge(use_ssl: uri.scheme == "https")

      Net::HTTP.start(uri.host, uri.port, conn_opts) do |http|
        handle_response(http.post(uri.path, body.to_json, headers.merge(extra_headers)))
      end
    end

    private

    # Returns connection options.
    # @return [Hash] Connection options.
    def connection_opts
      @connection_opts ||= { read_timeout: 180 }
    end

    # Returns HTTP headers to be sent during every request.
    # @return [Hash] Headers to be sent.
    def headers
      @headers ||= {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{@token}",
      }
    end

    # Builds hash from response.
    # @param response [String] Response string.
    # @return [Hash] Response from server converted to hash.
    def handle_response(response)
      response.value
      JSON.parse(response.body).with_indifferent_access
    rescue Net::HTTPClientException => e
      raise_error(e)
    end

    # @param exception [Exception] Exception raised.
    def raise_error(exception)
      message =
        begin
          JSON.parse(exception.try(:response)&.body).dig("error", "message")
        rescue JSON::ParserError
          nil
        end

      message ||= exception.message

      case exception.response
      when Net::HTTPNotFound
        raise DXClient::Errors::NotFoundError, message
      when Net::HTTPTooManyRequests
        raise DXClient::Errors::TooManyRequestsError, "Too many requests, please try later."
      end

      raise DXClient::Errors::DXClientError, message, exception.backtrace
    end
  end
end
