# Platform API client.
class DNAnexusAPI
  extend DXClient::Constants
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
        api.org_invite(ORG_DUMMY, email, suppressEmailNotification: true)
      rescue DXClient::Errors::NotFoundError
        return false
      end

      members = api.org_find_members(ORG_DUMMY)["results"]
      Utils.each_with_delay(members, 0.5) do |result|
        api.org_remove_member(ORG_DUMMY, result["id"]) if result["level"] == ORG_MEMBERSHIP_MEMBER
      end

      true
    end
  end

  def initialize(bearer_token, apiserver_url = DNANEXUS_APISERVER_URI)
    raise "Bearer token is null" if bearer_token.nil?

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
      redirect_uri: "#{job.https_job_external_url.downcase}:443/oauth2/access",
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
    call("user-#{username}", "describe")
    true
  rescue DXClient::Errors::NotFoundError
    false
  end

  def org_exists?(orgname)
    call("org-#{orgname}", "describe")
    true
  rescue DXClient::Errors::NotFoundError
    false
  end

  def entity_exists?(entity)
    call(entity.to_s, "describe")
    true
  rescue DXClient::Errors::NotFoundError
    false
  end
end
