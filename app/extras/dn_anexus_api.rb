# Platform API client.
class DNAnexusAPI
  include DXClient::Constants
  include DXClient::Endpoints::Apps
  include DXClient::Endpoints::Applets
  include DXClient::Endpoints::Files
  include DXClient::Endpoints::Organizations
  include DXClient::Endpoints::Projects
  include DXClient::Endpoints::System
  include DXClient::Endpoints::Users
  include DXClient::Endpoints::Workflows

  def self.for_admin
    new(ADMIN_TOKEN)
  end

  def self.for_challenge_bot
    new(CHALLENGE_BOT_TOKEN)
  end

  def initialize(bearer_token, apiserver_url = DNANEXUS_APISERVER_URI)
    raise "Bearer is nil" if bearer_token.nil?

    @transport = DXClient::Transport.new(bearer_token, apiserver_url)
  end

  def generate_permanent_link(file)
    opts = {
      project: file.project,
      preauthenticated: true,
      filename: file.name,
      duration: 9_999_999_999,
    }
    call(file.dxid, "download", opts)["url"]
  end

  def call(subject, method, input = {})
    @transport.call(subject, method, input)
  end

  def user_exists?(username)
    begin
      call("user-#{username}", "describe")
    rescue Net::HTTPClientException => e
      if e.message =~ /^404/
        return false
      end
      raise e
    end
    true
  end

  def org_exists?(orgname)
    begin
      call("org-#{orgname}", "describe")
    rescue Net::HTTPClientException => e
      if e.message =~ /^404/
        return false
      end
      raise e
    end
    true
  end

  def entity_exists?(entity)
    begin
      call(entity.to_s, "describe")
    rescue Net::HTTPClientException => e
      if e.message =~ /^404/
        return false
      end
      raise e
    end
    true
  end

  def self.email_exists?(email)
    api = new(ADMIN_TOKEN)
    begin
      api.call(ORG_DUMMY, "invite", invitee: email, suppressEmailNotification: true)
    rescue Net::HTTPClientException => e
      if e.message =~ /^404/
        return false
      end
      raise e
    end
    api.call(ORG_DUMMY, "findMembers")["results"].each do |result|
      if result["level"] == "MEMBER"
        api.call(ORG_DUMMY, "removeMember", user: result["id"])
      end
    end
    true
  end
end
