include_recipe("::configure_ssh")

app_dir = node["rails_app_dir"]
https_apps_dir = File.join(app_dir, "server")

directory app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]
end

ruby_block "set envs" do
  block do
    node.run_state["ssm_params"]["app"]["environment"].each do |name, val|
      ENV[name] = val
    end

    ENV["HOME"] = "/home/#{node[:deploy_user]}"
  end
end

# environment lazy { ENV.to_hash }

# probably checkout the correct branch
git app_dir do
  repository(lazy { node.run_state["ssm_params"]["app"]["app_source"]["url"] })
  revision(lazy { node.run_state["ssm_params"]["app"]["app_source"]["revision"] })
  ssh_wrapper node[:ssh_wrapper_path]
  depth 1
  user node[:deploy_user]
end

# create .env file
template File.join(https_apps_dir, ".env") do
  source "https_app_env.erb"
  variables(lazy { ENV.to_hash })
end

template File.join(https_apps_dir, "pm2-api.json") do
  source "pm2_api.erb"
end

template File.join(https_apps_dir, "pm2-worker.json") do
  source "pm2_worker.erb"
  variables(lazy do
              {
                instances: node.run_state.dig("ssm_params", "app", "environment", "NODE_WORKER_INSTANCES") || node["nodejs"]["worker"]["instances"],
              }
            end)
end

execute "make install" do
  cwd https_apps_dir
  command "pnpm install --frozen-lockfile --production=false"
  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end

execute "make build" do
  cwd https_apps_dir
  command "pnpm run build"
  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end
