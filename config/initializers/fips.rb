OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:ssl_version] ="TLSv1_2"
OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:ciphers] = "TLSv1.2+FIPS:kRSA+FIPS:!eNULL:!aNULL"
OpenSSL.fips_mode = true unless ActiveRecord::Type::Boolean.new.cast(ENV["NO_FIPS"])

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

Digest::MD5.prepend(SHA256_OpenSSL)
Digest::SHA1.prepend(SHA1_OpenSSL)
Digest::SHA256.prepend(SHA256_OpenSSL)
