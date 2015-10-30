class DNAnexusAuth
  def initialize(authserver_url)
    @authserver_url = authserver_url
  end

  def call(subject, method, input = {})
    uri = URI("#{@authserver_url}#{subject}/#{method}")
    Net::HTTP.start(uri.host, uri.port, {use_ssl: true}) do |http|
      response = http.post(uri.path, input.to_json, {"Content-Type" => "application/json"})
      response.value
      return JSON.parse(response.body)
    end
  end

  def post_form(path, input = {})
    uri = URI("#{@authserver_url}#{path}")
    Net::HTTP.start(uri.host, uri.port, {use_ssl: true}) do |http|
      response = http.post(uri.path, URI.encode_www_form(input))
      response.value
      return JSON.parse(response.body)
    end
  end

end
