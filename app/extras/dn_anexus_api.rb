class DNAnexusAPI

  def self.for_admin
    new(ADMIN_TOKEN)
  end

  def self.for_challenge_bot
    new(CHALLENGE_BOT_TOKEN)
  end

  def initialize(bearer_token, apiserver_url = DNANEXUS_APISERVER_URI)
    raise "Bearer is nil" if bearer_token.nil?
    @bearer_token = bearer_token
    @apiserver_url = apiserver_url
  end

  def generate_permanent_link(file)
    opts = { project: file.project, preauthenticated: true, filename: file.name, duration: 9999999999 }
    call(file.dxid, "download", opts)["url"]
  end

  def call(subject, method, input = {})
    uri = URI("#{@apiserver_url}#{subject}/#{method}")
    Net::HTTP.start(uri.host, uri.port, {read_timeout: 180, use_ssl: true}) do |http|
      handle_response(
        http.post(uri.path, input.to_json, {"Content-Type" => "application/json", "Authorization" => "Bearer #{@bearer_token}"})
      )
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

  def run_workflow(workflow_id, params)
    call(workflow_id, "run", params)
  end

  def create_workflow(params)
    call("workflow", "new", params)
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

  private

  def handle_response(response)
    response.value
    JSON.parse(response.body)
  rescue Net::HTTPServerException => e
    raise e, "#{e.message}. #{response.body}", e.backtrace
  end

end
