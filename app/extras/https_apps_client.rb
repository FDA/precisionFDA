# The client for communicating with JupiterLab service.
class HttpsAppsClient
  # Client's specific error.
  class Error < Net::HTTPClientException
    def initialize(response_body)
      @error_body = parsed_body(response_body)
    end

    def message
      @error_body["message"] || "Jupyter Labs service client error."
    end

    private

    def parsed_body(response_body)
      JSON.parse(response_body)
    rescue JSON::ParserError
      {}
    end
  end

  # @param token [String] User access token.
  # @param user [User] A user.
  def initialize(token, user)
    @token = token
    @user = user
  end

  # Run app.
  # @param app_dxid [String] App dxid.
  # @param opts [Hash] Request body options.
  def app_run(app_dxid, opts)
    request(
      "/apps/#{app_dxid}/run",
      opts,
      Net::HTTP::Post::METHOD,
    )
  end

  # Terminate the job.
  # @param job_dxid [String] Job dxid to terminate.
  # @param opts [Hash] Request body options.
  def job_terminate(job_dxid)
    request(
      "/jobs/#{job_dxid}/terminate",
      {},
      Net::HTTP::Patch::METHOD,
    )
  end

  private

  def request(path, body = {}, method_name = Net::HTTP::Post::METHOD)
    uri = URI("#{ENV['HTTPS_APPS_API_URL']}#{path}?#{auth_querystring}")
    use_ssl = uri.scheme == "https"

    conn_opts = connection_opts.merge(use_ssl: use_ssl)
    conn_opts.merge!(verify_mode: OpenSSL::SSL::VERIFY_NONE) if !production_env? && use_ssl

    Net::HTTP.start(uri.host, uri.port, conn_opts) do |http|
      handle_response(http.send_request(method_name, uri.request_uri, body.to_json, headers))
    end
  end

  # Returns connection options.
  # @return [Hash] Connection options.
  def connection_opts
    @connection_opts ||= { read_timeout: 120 }
  end

  def auth_querystring
    {
      id: @user.id,
      accessToken: @token,
      dxuser: @user.dxuser,
    }.to_query
  end

  # Returns HTTP headers to be sent during every request.
  # @return [Hash] Headers to be sent.
  def headers
    @headers ||= {
      "Content-Type" => "application/json",
    }
  end

  def production_env?
    ENV["DNANEXUS_BACKEND"] == "production"
  end

  # Builds hash from response.
  # @param response [String] Response string.
  # @return [Hash] Response from server converted to hash.
  def handle_response(response)
    response.value
    JSON.parse(response.body)
  rescue Net::HTTPClientException
    raise Error, response.body
  end
end
