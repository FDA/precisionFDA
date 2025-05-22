Rails.application.define_singleton_method(:message_verifier) do |salt|
  if salt == "ActiveStorage"
    Rails.logger.info "[PATCH] Adjusting ActiveStorage salt length"
    # OpenSSL-fipsv3 requires the salt to be minimum length of 16 bytes
    salt = "ActiveStorage_Salt_16bytes"
  end

  ActiveSupport::MessageVerifier.new(salt, digest: "SHA256")
end
