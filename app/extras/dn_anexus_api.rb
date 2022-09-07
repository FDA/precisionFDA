# Platform API client.
class DNAnexusAPI
  extend DXClient::Constants
  include DXClient::Constants
  include DXClient::Endpoints::Apps
  include DXClient::Endpoints::Applets
  include DXClient::Endpoints::Files
  include DXClient::Endpoints::DbClusters
  include DXClient::Endpoints::Organizations
  include DXClient::Endpoints::Projects
  include DXClient::Endpoints::System
  include DXClient::Endpoints::Users
  include DXClient::Endpoints::Jobs
  include DXClient::Endpoints::Workflows
  include DXClient::Common

  class << self
    def for_admin
      new(ADMIN_TOKEN)
    end

    def for_challenge_bot
      new(CHALLENGE_BOT_TOKEN)
    end
  end

  def initialize(bearer_token, apiserver_url = DNANEXUS_APISERVER_URI)
    raise "Bearer token is null" if bearer_token.nil?

    @transport = DXClient::Transport.new(bearer_token, apiserver_url)
  end

  def call(subject, method, input = {})
    @transport.call(subject, method, input)
  end
end
