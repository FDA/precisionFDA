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
  include DXClient::Endpoints::Jobs
  include DXClient::Endpoints::Workflows

  class << self
    def for_admin
      new(ADMIN_TOKEN)
    end

    def for_challenge_bot
      new(CHALLENGE_BOT_TOKEN)
    end

    def email_exists?(email)
      api = for_admin

      begin
        api.call(ORG_DUMMY, "invite", invitee: email, suppressEmailNotification: true)
      rescue Net::HTTPClientException => e
        return false if e.message =~ /^404/

        raise e
      end

      api.call(ORG_DUMMY, "findMembers")["results"].each do |result|
        api.call(ORG_DUMMY, "removeMember", user: result["id"]) if result["level"] == "MEMBER"
      end

      true
    end
  end

  def initialize(bearer_token, apiserver_url = DNANEXUS_APISERVER_URI)
    raise "Bearer is nil" if bearer_token.nil?

    @transport = DXClient::Transport.new(bearer_token, apiserver_url)
  end

  # Used with auth api endpoint only.
  # Needs only for Staging and Production, works without a coed on Dev stack and Dev env
  def get_https_job_auth_token(job)
    params = {
      grant_type: "authorization_code",
      scope: { full: true },
      label: "httpsapp",
      client_id: "httpsapp",
      redirect_uri: URI.join(job.https_job_external_url.downcase, "oauth2/access"),
    }

    call("system", "newAuthToken", params)["authorization_code"]
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
end
