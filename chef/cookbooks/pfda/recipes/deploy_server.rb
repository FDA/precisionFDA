include_recipe('::configure_ssh')

app_dir = node['app_root_dir']
server_dir = File.join(app_dir, 'packages', 'server')

directory app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]
end

ruby_block 'set envs' do
  block do
    node.run_state['ssm_params']['app']['environment'].each do |name, val|
      ENV[name] = val
    end

    ENV['HOME'] = "/home/#{node[:deploy_user]}"
  end
end

# environment lazy { ENV.to_hash }

# probably checkout the correct branch
git app_dir do
  repository(lazy { node.run_state['ssm_params']['app']['app_source']['url'] })
  revision(lazy { node.run_state['ssm_params']['app']['app_source']['revision'] })
  ssh_wrapper node[:ssh_wrapper_path]
  depth 1
  user node[:deploy_user]
end

# create .env file
template File.join(server_dir, '.env') do
  source 'server_env.erb'
  variables(lazy { ENV.to_hash })
end

template File.join(server_dir, 'pm2-api.json') do
  source 'pm2_api.erb'
end

template File.join(server_dir, 'pm2-worker.json') do
  source 'pm2_worker.erb'
  variables(lazy do
    {
      instances: node.run_state.dig('ssm_params', 'app', 'environment',
                                    'NODE_WORKER_INSTANCES') || node['nodejs']['worker']['instances']
    }
  end)
end

template File.join(server_dir, 'pm2-admin-platform-client.json') do
  source 'pm2_admin_platform_client.erb'
  variables(lazy do
    {
      instances: node.run_state.dig('ssm_params', 'app', 'environment',
                                    'NODE_ADMIN_PLATFORM_CLIENT_INSTANCES') || node['nodejs']['admin-platform-client']['instances']
    }
  end)
end

execute 'Server install deps' do
  cwd app_dir
  command 'pnpm install --frozen-lockfile --filter=\!pfda-frontend --production=false'

  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end

execute 'make build' do
  cwd app_dir
  command 'pnpm run build --filter=\!pfda-frontend'
  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end
