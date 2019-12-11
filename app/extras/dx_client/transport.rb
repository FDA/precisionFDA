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
    # @param input [Hash] Additional opts,
    # @return [Hash] The response from API server.
    def call(subject, method, input = {})
      uri = URI("#{@api_server}#{subject}/#{method}")

      Net::HTTP.start(uri.host, uri.port, read_timeout: 180, use_ssl: true) do |http|
        response = http.post(uri.path, input.to_json,
                             "Content-Type" => "application/json",
                             "Authorization" => "Bearer #{@token}")

        handle_response(response)
      end
    end

    private

    # Builds hash from response.
    # @param response [String] Response string.
    # @return [Hash] Response from server converted to hash.
    def handle_response(response)
      response.value
      JSON.parse(response.body)
    rescue Net::HTTPServerException => e
      raise e, "#{e.message}. #{response.body}", e.backtrace
    end
  end
end
