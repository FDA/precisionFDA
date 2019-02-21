OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:ssl_version] ="TLSv1_2"
OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:ciphers] = "TLSv1.2+FIPS:kRSA+FIPS:!eNULL:!aNULL"
OpenSSL.fips_mode = true unless ENV['NO_FIPS']

module MD5_OpenSSL
  def self.prepended(base)
    class << base
      prepend ClassMethods
    end
  end

  module ClassMethods
    def new(override = true)
      override ? OpenSSL::Digest::SHA256.new : super()
    end

    def hexdigest(s = '', override = true)
      override ? OpenSSL::Digest('SHA256').hexdigest(s) :
                 Digest.hexencode(new(false).digest(s))
    end

    def digest(s = '', override = true)
      override ? OpenSSL::Digest('SHA256').digest(s) : super(s)
    end
  end
end

module SHA256_OpenSSL
  def self.prepended(base)
    base.prepend(InstanceMethods)
    class << base
      prepend ClassMethods
      prepend InstanceMethods
    end
  end

  module InstanceMethods
    def hexdigest(s = '')
      OpenSSL::Digest('SHA256').hexdigest(s)
    end

    def digest(s = '')
      OpenSSL::Digest('SHA256').digest(s)
    end
  end

  module ClassMethods
    def new
      OpenSSL::Digest::SHA256.new
    end
  end
end

module SHA1_OpenSSL
  def self.prepended(base)
    base.prepend(InstanceMethods)
    class << base
      prepend ClassMethods
      prepend InstanceMethods
    end
  end

  module InstanceMethods
    def hexdigest(s = '')
      OpenSSL::Digest('SHA1').hexdigest(s)
    end

    def digest(s = '')
      OpenSSL::Digest('SHA1').digest(s)
    end
  end

  module ClassMethods
    def new
      OpenSSL::Digest::SHA1.new
    end
  end
end

Digest::MD5.prepend(MD5_OpenSSL)
Digest::SHA1.prepend(SHA1_OpenSSL)
Digest::SHA256.prepend(SHA256_OpenSSL)
