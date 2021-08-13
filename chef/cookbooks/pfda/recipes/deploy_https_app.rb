aws_ssm_parameter_store "get app params" do
  path "#{node[:ssm_base_path]}/app/"
  recursive true
  with_decryption true
  return_key "app"
  action :get_parameters_by_path
  region node[:aws_region]
end

app_dir = node["rails_app_dir"]
https_apps_dir = File.join(app_dir, "https-apps-api")
nodejs_bin = node["nodejs"]["bin_path"]
key_path = "/home/#{node[:deploy_user]}/.ssh/id_rsa"
ssh_wrapper_path = "/tmp/wrap-ssh4git.sh"

application app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]

  ruby_block "set envs" do
    block do
      node.run_state["app"]["environment"].each do |name, val|
        ENV[name] = val
      end
    end
  end

  environment lazy { ENV.to_hash }

  file key_path do
    content lazy { node.run_state["app"]["app_source"]["ssh_key"] }
    mode 0600
  end

  template ssh_wrapper_path do
    source "wrap-ssh4git.sh.erb"
    variables key_path: key_path
    owner node[:deploy_user]
    mode 0700
  end

  # probably checkout the correct branch
  git app_dir do
    repository lazy { node.run_state["app"]["app_source"]["url"] }
    revision lazy { node.run_state["app"]["app_source"]["revision"] }
    ssh_wrapper ssh_wrapper_path
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
  end

  execute "make install" do
    cwd https_apps_dir
    command "#{nodejs_bin}yarn"
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  execute "make build" do
    cwd https_apps_dir
    command "#{nodejs_bin}yarn workspaces run build"
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  execute "run the api" do
    cwd https_apps_dir
    user node[:deploy_user]
    command "#{nodejs_bin}pm2 startOrReload ./pm2-api.json"
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  execute "run the worker" do
    cwd https_apps_dir
    user node[:deploy_user]
    command "#{nodejs_bin}pm2 startOrReload ./pm2-worker.json"
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end
end
