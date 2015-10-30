class DNAnexusAPI
  def initialize(bearer_token, apiserver_url = DNANEXUS_APISERVER_URI)
    @bearer_token = bearer_token
    @apiserver_url = apiserver_url
  end

  #
  # TODO: For now this is basic (no retry, no error handling)
  #
  def call(subject, method, input = {})
    uri = URI("#{@apiserver_url}#{subject}/#{method}")
    Net::HTTP.start(uri.host, uri.port, {use_ssl: true}) do |http|
      response = http.post(uri.path, input.to_json, {"Content-Type" => "application/json", "Authorization" => "Bearer #{@bearer_token}"})
      response.value
      return JSON.parse(response.body)
    end
  end

end
