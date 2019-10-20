module DXClient
  module Endpoints
    # Provides users-related methods.
    module Users
      # Creates new user with provided params.
      # @param opts [Hash] Options for user creating.
      # @option opts [String] :username Username
      # @option opts [String] :email Email
      # @option opts [String] :first First name
      # @option opts [String] :last Last name
      # @option opts [String] :billTo Organization to bill to
      def user_new(opts = {})
        call("user", "new", opts)
      end

      # Updates user's information
      # @see https://documentation.dnanexus.com/developer/api/users#api-method-user-xxxx-update
      # @param user_dxid [String] User to update.
      # @param opts [Hash] Additional options.
      # @return [Hash]
      def user_update(user_dxid, opts = {})
        call(user_dxid, "update", opts)
      end
    end
  end
end
