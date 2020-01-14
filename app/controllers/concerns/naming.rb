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
  end
end
