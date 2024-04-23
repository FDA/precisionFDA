# Generates unused orgname by adding and increasing sequence number for provided username,
class UnusedOrgnameGenerator
  RESERVED_SIZE = 4 # 3 digits plus 1 dot

  # Constructor.
  # @param api [DNAnexusAPI] API client to use for checks.
  def initialize(api)
    @api = api
  end

  # Performs generation of unused orgname. Checks provided username first.
  # @param username [String] Initial username to check,
  # @param delay [Integer] delay between the requests to the platform
  # @return [String] Unused org handle.
  def call(username, delay = 2)
    base_name = username.sub(".", "")
    base_name = base_name[0...Org::HANDLE_MAX_LENGTH - Org::PFDA_PREFIX.size - RESERVED_SIZE]

    idx = 2
    candidate = base_name.dup

    while Org.where(handle: candidate).exists? || @api.org_exists?(Org::PFDA_PREFIX + candidate)
      candidate = "#{base_name}.#{idx}"
      sleep delay
      idx += 1
    end

    candidate
  end
end
