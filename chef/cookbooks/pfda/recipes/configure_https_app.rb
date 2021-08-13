aws_ssm_parameter_store "get https server private key and certificate" do
  path "#{node[:ssm_base_path]}/app/ssl_configuration/"
  recursive true
  with_decryption true
  return_key "https_server"
  action :get_parameters_by_path
  region node[:aws_region]
end

file "/etc/nginx/ssl/https_server.crt" do
  content lazy { node.run_state["https_server"]["certificate"] }
end

file "/etc/nginx/ssl/https_server.key" do
  content lazy { node.run_state["https_server"]["private_key"] }
end
