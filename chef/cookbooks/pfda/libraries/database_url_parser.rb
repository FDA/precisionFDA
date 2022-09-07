class Chef::Recipe::DatabaseUrlParser
  def self.call(url)
    uri = URI(url)

    {
      'database' => uri.path.sub(%r{^/}, ""),
      'host' => uri.host,
      'username' => uri.user,
      'password' => uri.password,
      'reconnect' => nil,
      'port' => uri.port,
    }
  end
end
