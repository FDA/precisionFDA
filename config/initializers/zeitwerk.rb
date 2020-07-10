Rails.autoloaders.each do |autoloader|
  autoloader.inflector = Zeitwerk::Inflector.new
  autoloader.inflector.inflect(
    "di_container" => "DIContainer",
    "ioc" => "IOC",
    "dn_anexus_api" => "DNAnexusAPI",
    "dn_anexus_auth" => "DNAnexusAuth",
    "dx_client" => "DXClient",
    "dx_client_error" => "DXClientError",
    "wdl_object" => "WDLObject",
    "io_object" => "IOObject",
    "io_object_presenter" => "IOObjectPresenter",
    "zip_code_api" => "ZipCodeAPI",
    "io_collection" => "IOCollection",
  )
end
