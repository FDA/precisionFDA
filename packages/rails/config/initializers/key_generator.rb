# Purpose - use SHA256 instead of SHA1 for key derivation
module ActiveSupport
  class KeyGenerator
    def generate_key(salt, key_size = 64)
      OpenSSL::PKCS5.pbkdf2_hmac(@secret, salt, @iterations, key_size, OpenSSL::Digest.new("SHA256"))
    end
  end
end
