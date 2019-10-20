module IOC
  module NS
    API = Dry::Container::Namespace.new("api") do
      register("user", memoize: true) { DNAnexusAPI.new(config[:token]) }
      register("admin", memoize: true) { DNAnexusAPI.new(ADMIN_TOKEN) }
      register("auth", memoize: true) { DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI) }
    end
  end
end
