# Adds 'encryptor' option to application configuration.
Rails.configuration.encryptor = begin
  config = Rails.configuration
  secrets = Rails.application.secrets
  key_len = ActiveSupport::MessageEncryptor.key_len
  key_generator = ActiveSupport::KeyGenerator.new(secrets.secret_key_base, iterations: 1_000)
  secret = key_generator.generate_key(config.action_dispatch.encrypted_cookie_salt, key_len)
  sign_secret = key_generator.generate_key(config.action_dispatch.encrypted_signed_cookie_salt)
  ActiveSupport::MessageEncryptor.new(secret, sign_secret)
end
