# Provides username-related methods.
module Naming
  extend ActiveSupport::Concern

  included do
    # Tries to find unused username.
    # @param username [String] Base name.
    # @return [String] Unused username.
    def find_unused_username(username)
      api = DIContainer.resolve("api.user")
      UnusedUsernameGenerator.new(api).call(username)
    end

    # Tries to find unused org handle.
    # @param username [String] Base name.
    # @return [String] Unused org handle.
    def find_unused_orgname(username)
      service = DIContainer.resolve("orgs.unused_orgname_generator")
      service.call(username)
    end
  end
end
