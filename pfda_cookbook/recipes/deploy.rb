include_recipe('::deploy_ruby')

app = search('aws_opsworks_app').first

template "/etc/logrotate.d/opsworks_app_#{app['shortname']}" do
  backup false
  source "logrotate.erb"
  owner "root"
  group "root"
  mode 0644
  variables( :log_dirs => ["#{node['rails_app_dir']}/log" ] )
end
