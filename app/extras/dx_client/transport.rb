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
    def call(subject, method, body = {})
      uri = URI("#{@api_server}#{subject}/#{method}")

      Net::HTTP.start(uri.host, uri.port, connection_opts) do |http|
        handle_response(http.post(uri.path, body.to_json, headers))
      end
    end

    private

    # Returns connection options.
    # @return [Hash] Connection options.
    def connection_opts
      @connection_opts ||= { read_timeout: 180, use_ssl: true }
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
      JSON.parse(response.body)
    rescue Net::HTTPClientException => e
      raise e, "#{e.message}. #{response.body}", e.backtrace
    end
  end
end
