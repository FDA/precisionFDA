# Provides username-related methods.
module Naming
  extend ActiveSupport::Concern

  included do
    # Tries to find unused username.
    # @param username [String] Base name.
    # @return [String] Unused username.
    def find_unused_username(username)
      api = DNAnexusAPI.new(RequestContext.instance.token)
      UnusedUsernameGenerator.new(api).call(username)
    end

    # Tries to find unused org handle.
    # @param username [String] Base name.
    # @return [String] Unused org handle.
    def find_unused_orgname(username)
      service = UnusedOrgnameGenerator.new(DNAnexusAPI.new(RequestContext.instance.token))
      service.call(username)
    end
  end
end
