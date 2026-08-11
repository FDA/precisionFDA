# Generates auth keys understood by the nodejs-api service.
#
# The Node API's UserContextMiddleware only accepts "Authorization: Key <token>"
# headers, where the token is an encrypted user session produced by the shared
# Rails encryptor (see config/initializers/rails_encryptor.rb). The Node side
# decrypts it with CliEncryptor using the same SECRET_KEY_BASE, so keys minted
# here are valid for both the CLI endpoints and server-to-server calls.
class NodeApiAuthKey
  DEFAULT_DURATION = 1.day

  CONTEXT_FIELDS = %w(user_id username token expiration org_id).freeze

  class << self
    # Generates an auth key for a user record and a platform token.
    # Intended for service-level (server-to-server) calls to the Node API,
    # including "act-as" flows where the platform token belongs to another
    # principal (e.g. the challenge bot) than the acting user.
    #
    # @param user [User] The user the Node API should act as.
    # @param token [String] The platform (DNAnexus) token to use for platform calls.
    # @param duration [ActiveSupport::Duration, Integer] Validity period of the key.
    # @param expiration [Integer, nil] Optional platform token expiration (unix seconds)
    #   used to clamp the key validity.
    # @return [String] Encrypted auth key.
    def generate(user:, token:, duration: DEFAULT_DURATION, expiration: nil)
      encrypt(
        "user_id" => user.id,
        "username" => user.dxuser,
        "token" => token,
        "expiration" => clamp_expiration(expiration, duration),
        "org_id" => user.org_id,
      )
    end

    # Generates an auth key from a session context (controller usage).
    #
    # @param context [Context, Hash] The current session context.
    # @param duration [ActiveSupport::Duration, Integer] Validity period of the key.
    # @return [String] Encrypted auth key.
    def from_context(context, duration: DEFAULT_DURATION)
      payload = context.as_json.slice(*CONTEXT_FIELDS)
      payload["expiration"] = clamp_expiration(payload["expiration"], duration)
      encrypt(payload)
    end

    private

    def clamp_expiration(expiration, duration)
      [expiration, Time.now.to_i + duration.to_i].compact.min
    end

    def encrypt(payload)
      Rails.configuration.encryptor.encrypt_and_sign({ context: payload }.to_json)
    end
  end
end
