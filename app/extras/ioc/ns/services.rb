module IOC
  module NS
    Services = Dry::Container::Namespace.new("services") do
      import API

      register("copy_service") do
        CopyService.new(
          api: resolve("api.user"),
          user: config[:user],
        )
      end
    end
  end
end
