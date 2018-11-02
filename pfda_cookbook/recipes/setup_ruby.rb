directory '/tmp/build'

apt_update 'update'

%w(autoconf bison build-essential libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm3 libgdbm-dev libpcre3-dev ca-certificates libx11-dev libmysqlclient-dev systemd).each do |pkg|
  apt_package pkg
end

apt_package 'awscli' do
  options '-y'
end

remote_file "/tmp/build/openssl-fips-#{node['fips_version']}.tar.gz" do
  source "https://www.openssl.org/source/openssl-fips-#{node['fips_version']}.tar.gz"
end

fips_dir = "/tmp/build/openssl-fips-#{node['fips_version']}"

execute "tar xzf /tmp/build/openssl-fips-#{node['fips_version']}.tar.gz" do
  cwd '/tmp/build'
  creates fips_dir
end

bash 'build fips' do
  code "./config && make install"
  cwd fips_dir
  creates '/usr/local/ssl/fips-2.0/lib/fipscanister.o'
end

openssl_dir = "/tmp/build/openssl-#{node['openssl_version']}"

remote_file "/tmp/build/openssl-#{node['openssl_version']}.tar.gz" do
  source "https://www.openssl.org/source/openssl-#{node['openssl_version']}.tar.gz"
end

execute "tar xzf /tmp/build/openssl-#{node['openssl_version']}.tar.gz" do
  cwd '/tmp/build'
  creates openssl_dir
end

bash 'build shared OpenSSL' do
  code "make clean && ./Configure linux-x86_64 --prefix=/usr/local/ssl fips shared && make depend && make --jobs=#{node['cpu']['total']} && make install"
  cwd openssl_dir
  creates '/usr/local/ssl/lib/libcrypto.so'
end

ruby_dir="/tmp/build/ruby-#{node['ruby_version']}"

ruby_major_version = node['ruby_version'].split('.').take(2).join('.')

remote_file "/tmp/build/ruby-#{node['ruby_version']}.tar.gz" do
  source "https://cache.ruby-lang.org/pub/ruby/#{ruby_major_version}/ruby-#{node['ruby_version']}.tar.gz"
end

execute "tar xzf /tmp/build/ruby-#{node['ruby_version']}.tar.gz" do
  cwd '/tmp/build'
  creates ruby_dir
end

bash 'build ruby' do
  code "./configure --prefix=/usr/local --with-openssl --disable-install-doc --with-openssl-dir=/usr/local/ssl && make --jobs=#{node['cpu']['total']} && make install"
  cwd ruby_dir
  creates '/usr/local/bin/ruby'
end

directory '/usr/local/ssl/ssl/certs' do
  action :delete
end

link '/usr/local/ssl/ssl/certs' do
  to '/etc/ssl/certs'
end

execute "gem install bundler"
