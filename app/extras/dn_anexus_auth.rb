class DNAnexusAuth
  FETCH_TOKEN_PATH = "oauth2/token".freeze

  def initialize(authserver_url)
    @authserver_url = authserver_url
  end

  def call(subject, method, input = {})
    uri = URI("#{@authserver_url}#{subject}/#{method}")

    Net::HTTP.start(uri.host, uri.port, {use_ssl: true}) do |http|
      response = http.post(uri.path, input.to_json, {"Content-Type" => "application/json"})
      response.value
      JSON.parse(response.body)
    end
  end

  def fetch_token(code)
    uri = URI("#{@authserver_url}#{FETCH_TOKEN_PATH}")

    post_params = {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: OAUTH2_REDIRECT_URI,
      client_id: OAUTH2_CLIENT_ID
    }

    Net::HTTP.start(uri.host, uri.port, { use_ssl: true }) do |http|
      response = http.post(
        uri.path,
        URI.encode_www_form(post_params)
      )

      response.value

      JSON.parse(response.body)
    end
  rescue Net::HTTPServerException => e
    {}
  end
end
