class DNAnexusAPI
  def initialize(bearer_token, apiserver_url = DNANEXUS_APISERVER_URI)
    raise "Bearer is nil" if bearer_token.nil?
    @bearer_token = bearer_token
    @apiserver_url = apiserver_url
  end

  def call(subject, method, input = {})
    uri = URI("#{@apiserver_url}#{subject}/#{method}")
    Net::HTTP.start(uri.host, uri.port, {read_timeout: 90, use_ssl: true}) do |http|
      response = http.post(uri.path, input.to_json, {"Content-Type" => "application/json", "Authorization" => "Bearer #{@bearer_token}"})
      response.value
      return JSON.parse(response.body)
    end
  end

  def user_exists?(username)
    begin
      call("user-#{username}", "describe")
    rescue Net::HTTPServerException => e
      if e.message =~ /^404/
        return false
      end
      raise e
    end
    return true
  end

  def entity_exists?(entity)
    begin
      call(entity.to_s, "describe")
    rescue Net::HTTPServerException => e
      if e.message =~ /^404/
        return false
      end
      raise e
    end
    return true
  end

  def self.email_exists?(email)
    api = self.new(ADMIN_TOKEN)
    begin
      api.call(ORG_DUMMY, "invite", {invitee: email, suppressEmailNotification: true})
    rescue Net::HTTPServerException => e
      if e.message =~ /^404/
        return false
      end
      raise e
    end
    api.call(ORG_DUMMY, "findMembers")["results"].each do |result|
      if result["level"] == "MEMBER"
        api.call(ORG_DUMMY, "removeMember", {user: result["id"]})
      end
    end
    return true
  end

end
