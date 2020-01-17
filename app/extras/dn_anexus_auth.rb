class DNAnexusAuth
  FETCH_TOKEN_PATH = "oauth2/token".freeze

  def initialize(authserver_url, bearer_token = nil)
    @authserver_url = authserver_url
    @bearer_token = bearer_token
  end

  def call(subject, method, input = {})
    uri = URI("#{authserver_url}#{subject}/#{method}")
    headers = { "Content-Type" => "application/json" }
    headers["Authorization"] = "Bearer #{bearer_token}" if bearer_token.present?
    Net::HTTP.start(uri.host, uri.port, use_ssl: true) do |http|
      handle_response(http.post(uri.path, input.to_json, headers))
    end
  end

  def fetch_token(code)
    uri = URI("#{@authserver_url}#{FETCH_TOKEN_PATH}")

    post_params = {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: OAUTH2_REDIRECT_URI,
      client_id: OAUTH2_CLIENT_ID,
    }

    Net::HTTP.start(uri.host, uri.port, use_ssl: true) do |http|
      response = http.post(
        uri.path,
        URI.encode_www_form(post_params)
      )

      response.value

      JSON.parse(response.body)
    end
  rescue Net::HTTPClientException => e
    {}
  end

  private

  attr_reader :bearer_token, :authserver_url

  def handle_response(response)
    response.value
    JSON.parse(response.body)
  rescue Net::HTTPClientException => e
    raise AuthError.new("#{e.message}. #{e.backtrace}", JSON.parse(response.body))
  end
end
