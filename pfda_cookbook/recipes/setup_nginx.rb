openssl_dir = "/tmp/build/openssl-#{node['openssl_version']}"

bash 'build static OpenSSL' do
  code <<-EOF
  make clean && \
  ./Configure linux-x86_64 --prefix=/usr/local/ssl_static fips no-shared && \
  make depend && \
  make --jobs=#{node['cpu']['total']} && \
  make install
  EOF

  cwd openssl_dir
  creates '/usr/local/ssl_static/lib/libcrypto.a'
end

nginx_dir = "/tmp/build/nginx-#{node['nginx_version']}"
nginx_filename = "nginx-#{node['nginx_version']}.tar.gz"

remote_file "/tmp/build/#{nginx_filename}" do
  source "https://nginx.ru/download/#{nginx_filename}"
end

execute "tar xzf /tmp/build/#{nginx_filename}" do
  cwd '/tmp/build'
  creates nginx_dir
end

bash 'build nginx' do
  code "./configure --prefix=/usr/local --with-http_ssl_module --with-http_v2_module --with-cc-opt='-I /usr/local/ssl_static/include' --with-ld-opt='-L /usr/local/ssl_static/lib' && make --jobs=#{node['cpu']['total']} && make install"
  cwd nginx_dir
  creates '/usr/local/sbin/nginx'
end

cookbook_file "/etc/ssl/certs/dhparam.pem" do
  source "dhparam.pem"
  owner "root"
  group "root"
end
