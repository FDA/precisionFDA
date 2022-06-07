include_recipe('::configure_ssh')

app_dir = node["rails_app_dir"]
https_apps_dir = File.join(app_dir, "https-apps-api")
nodejs_bin = node["nodejs"]["bin_path"]

application app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]

  ruby_block "set envs" do
    block do
      node.run_state["ssm_params"]["app"]["environment"].each do |name, val|
        ENV[name] = val
      end

      ENV["HOME"] = "/home/#{node[:deploy_user]}"
      ENV["PATH"] = "#{node["nodejs"]["bin_path"]}:#{ENV['PATH']}"
    end
  end

  environment lazy { ENV.to_hash }

  # probably checkout the correct branch
  git app_dir do
    repository lazy { node.run_state["ssm_params"]["app"]["app_source"]["url"] }
    revision lazy { node.run_state["ssm_params"]["app"]["app_source"]["revision"] }
    ssh_wrapper node[:ssh_wrapper_path]
    depth 1
    user node[:deploy_user]
  end

  # create .env file
  template File.join(https_apps_dir, ".env") do
    source "https_app_env.erb"
    variables lazy { ENV.to_hash }
  end

  template File.join(https_apps_dir, "pm2-api.json") do
    source "pm2_api.erb"
  end

  template File.join(https_apps_dir, "pm2-worker.json") do
    source "pm2_worker.erb"
    variables lazy { {
      instances: node.run_state.dig("ssm_params", "app", "environment", "NODE_WORKER_INSTANCES") ||
                 node["nodejs"]["worker"]["instances"],
    } }
  end

  execute "make install" do
    cwd https_apps_dir
    command "yarn --frozen-lockfile --production=false"
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
  end

  execute "make build" do
    cwd https_apps_dir
    command "yarn workspaces run build"
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
  end

  execute "run the api" do
    cwd https_apps_dir
    user node[:deploy_user]
    command "pm2 startOrReload ./pm2-api.json"
    environment lazy { ENV.to_hash }
  end

  execute "run the worker" do
    cwd https_apps_dir
    user node[:deploy_user]
    command "pm2 startOrReload ./pm2-worker.json"
    environment lazy { ENV.to_hash }
  end
end
