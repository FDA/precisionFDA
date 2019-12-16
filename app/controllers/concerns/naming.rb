module Naming
  extend ActiveSupport::Concern

  included do
    def find_unused_username(username)
      api = DIContainer.resolve("api.user")
      UnusedUsernameGenerator.new(api).call(username)
    end
  end
end
