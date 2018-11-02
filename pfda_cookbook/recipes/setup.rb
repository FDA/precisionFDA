user node['deploy_user'] do
  home "/home/#{node['deploy_user']}"
  shell '/bin/bash'
  manage_home true
  action [:create, :manage]
end

group node['deploy_user_group'] do
  members 'deploy'
end

directory node['rails_app_dir'] do
  owner node['deploy_user']
  group node['deploy_user_group']
  recursive true
end

directory node['nginx']['log_dir'] do
  recursive true
end

remote_file node['mysql_rds_sslca_path'] do
  source "https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem"
end

include_recipe('::setup_ruby')
include_recipe('::setup_nginx')
include_recipe('::setup_postfix')
include_recipe('::setup_ntp')
include_recipe('::setup_aide')
include_recipe('::setup_cloudwatch')
include_recipe('::setup_qualys_agent')
include_recipe('::setup_usage_report')
