app_dir = node["rails_app_dir"]
https_apps_dir = File.join(app_dir, "server")

execute "run the api" do
  cwd https_apps_dir
  user node[:deploy_user]
  command "pm2 startOrReload ./pm2-api.json"
  environment(lazy { ENV.to_hash })
end

execute "run the worker" do
  cwd https_apps_dir
  user node[:deploy_user]
  command "pm2 startOrReload ./pm2-worker.json"
  environment(lazy { ENV.to_hash })
end

execute "setup systemd unit" do
  cwd https_apps_dir
  user "root"
  command "pm2 startup -u #{node[:deploy_user]} --hp /home/#{node[:deploy_user]}"
  environment(lazy { ENV.to_hash })
end
