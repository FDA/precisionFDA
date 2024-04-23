template "/etc/logrotate.d/#{node['app']['shortname']}" do
  backup false
  source 'logrotate.erb'
  owner 'root'
  group 'root'
  mode 0o644
  variables(
    log_dirs: ["#{node['app_root_dir']}/log", "/home/#{node[:deploy_user]}/.pm2/logs"],
    period: lazy { node.run_state.dig('ssm_params', 'logrotate', 'period') || node[:logrotate][:period] },
    retention: lazy { node.run_state.dig('ssm_params', 'logrotate', 'retention') || node[:logrotate][:retention] }
  )
end
