# Generates unused username by adding and increasing sequence number for provided username,
class UnusedUsernameGenerator
  # Constructor.
  # @param api [DNAnexusAPI] API client to use for checks.
  def initialize(api)
    @api = api
  end

  # Performs generation of unused username. Checks provided username first.
  # @param username [String] Initial username to check,
  # @param delay [Integer] delay between the requests to the platform
  # @return [String] Unused username.
  def call(username, delay = 2)
    candidate = username
    i = 2

    while @api.user_exists?(candidate)
      candidate = "#{username}.#{i}"
      sleep delay
      i += 1
    end

    candidate
  end
end
