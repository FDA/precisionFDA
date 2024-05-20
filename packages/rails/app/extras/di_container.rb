# Exposes IoC Container to the app.
module DIContainer
  extend self

  # Creates IoC container with provided arguments.
  # @param user [User] User to instantiate container for.
  # @param token [String] User's token.
  # @return [IOC::Container] Instantiated container.
  def configure(user, token)
    @container = IOC::Container.new(token, user)
  end

  def respond_to_missing?(method, include_private = true)
    super
  end

  def method_missing(method, *args, &block)
    raise IOC::Error, "Container is not configured!" unless @container

    @container.respond_to?(method) ? @container.send(method, *args, &block) : super
  end

  # Shuts down container. Since container depends on user and token, this method
  # should be called when user logs out.
  def shutdown
    @container = nil
  end
end
