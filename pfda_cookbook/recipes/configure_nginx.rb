app = search('aws_opsworks_app').first

if app['enable_ssl']
  directory '/etc/nginx/ssl' do
    recursive true
  end

  file '/etc/nginx/ssl/pfda.crt' do
    content app['ssl_configuration']['certificate']
  end

  file '/etc/nginx/ssl/pfda.key' do
    content app['ssl_configuration']['private_key']
  end
end

template "/usr/local/conf/nginx.conf" do
  source 'nginx.conf.erb'
  variables({
    app_domain: app['domains'][0]
  })
end

poise_service "nginx" do
  command "/usr/local/sbin/nginx"
  provider :systemd
  options template: 'nginx_systemd.erb'
end

template "/usr/local/conf/nginx.conf" do
  action :nothing
  notifies :reload, 'poise_service[nginx]', :delayed
end
