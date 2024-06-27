app_dir = node['app_root_dir']
server_dir = File.join(app_dir, 'packages', 'server')

execute 'run the api' do
  cwd server_dir
  user node[:deploy_user]
  command 'pm2 startOrReload ./pm2-api.json'
  environment(lazy { ENV.to_hash })
end

execute 'run the worker' do
  cwd server_dir
  user node[:deploy_user]
  command 'pm2 startOrReload ./pm2-worker.json'
  environment(lazy { ENV.to_hash })
end

execute 'run the admin platform client' do
  cwd server_dir
  user node[:deploy_user]
  command 'pm2 startOrReload ./pm2-admin-platform-client.json'
  environment(lazy {
    env_hash = ENV.to_hash
    env_hash['ADMIN_TOKEN'] = node.run_state.dig('ssm_params', 'app', 'secrets')&.fetch('ADMIN_TOKEN', nil)
    env_hash
  })
end

execute 'setup systemd unit' do
  cwd server_dir
  user 'root'
  command "pm2 startup -u #{node[:deploy_user]} --hp /home/#{node[:deploy_user]}"
  environment(lazy { ENV.to_hash })
end
