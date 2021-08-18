aws_ssm_parameter_store "get app params" do
  path "#{node[:ssm_base_path]}/app/"
  recursive true
  with_decryption true
  return_key "app"
  action :get_parameters_by_path
  region node[:aws_region]
end

file node[:ssh_key_path] do
  content lazy { node.run_state["app"]["app_source"]["ssh_key"] }
  mode 0600
end

template node[:ssh_wrapper_path] do
  source "wrap-ssh4git.sh.erb"
  variables key_path: node[:ssh_key_path]
  owner node[:deploy_user]
  mode 0700
end
