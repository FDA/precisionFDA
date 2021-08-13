include_recipe('::deploy_ruby')
include_recipe('::deploy_https_app')

# Fix for https://jira.internal.dnanexus.com/browse/SEC-1302. Deploy task is creating a temp folder
# without sticky bit set. Set the sticky bit for this folder at the end of deployment
directory '/tmp/bundler/home' do
  recursive true
  mode '1777'
end

template "/etc/logrotate.d/#{node["app"]["shortname"]}" do
  backup false
  source "logrotate.erb"
  owner "root"
  group "root"
  mode 0644
  variables(
    log_dirs: ["#{node['rails_app_dir']}/log"]
  )
end
