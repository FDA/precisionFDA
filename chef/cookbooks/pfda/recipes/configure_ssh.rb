file node[:ssh_key_path] do
  content lazy { node.run_state["ssm_params"]["app"]["app_source"]["ssh_key"] }
  owner node[:deploy_user]
  group node[:deploy_user]
  mode 0600
end

template node[:ssh_wrapper_path] do
  source "wrap-ssh4git.sh.erb"
  variables key_path: node[:ssh_key_path]
  owner node[:deploy_user]
  group node[:deploy_user]
  mode 0700
end
