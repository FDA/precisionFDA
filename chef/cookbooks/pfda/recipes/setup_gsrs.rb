include_recipe('::configure_ssh')

gsrs_src_path = node[:gsrs][:app_src_dir]

aws_ssm_parameter_store "get qualys params" do
  path "#{node[:ssm_base_path]}/gsrs/"
  recursive true
  with_decryption true
  return_key "gsrs"
  action :get_parameters_by_path
  region node[:aws_region]
end

ruby_block "set envs" do
  block do
    ENV["HOME"] = "/home/#{node[:deploy_user]}"
    ENV["PATH"] = "#{node["nodejs"]["bin_path"]}:#{ENV['PATH']}"
  end
end

git gsrs_src_path do
  repository node[:gsrs][:repo_url]
  revision lazy { node.run_state.dig("gsrs", "revision") || node[:gsrs][:revision] }
  ssh_wrapper node[:ssh_wrapper_path]
  depth 1
  user node[:deploy_user]
  group node[:deploy_user]
end

# This should only have to be run once.
execute "Setup G-SRS" do
  cwd gsrs_src_path
  command "./setup.sh"
  user node[:deploy_user]
  group node[:deploy_user]
  environment lazy { ENV.to_hash }
end
