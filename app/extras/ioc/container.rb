module IOC
  # IoC container implementation.
  class Container
    include Dry::Container::Mixin

    setting :token
    setting :user

    # Constructor.
    # @param token [String] User's token.
    # @param user [User] User to instantiate container for.
    def initialize(token, user)
      super()
      config[:token] = token
      config[:user] = user
      configure
    end

    private

    # Configures container by importing namespaces.
    def configure
      import NS::API
      import NS::Orgs
    end
  end
end
