file "/etc/nginx/ssl/https_server.crt" do
  content lazy { node.run_state["ssm_params"]["app"]["ssl_configuration"]["certificate"] }
end

file "/etc/nginx/ssl/https_server.key" do
  content lazy { node.run_state["ssm_params"]["app"]["ssl_configuration"]["private_key"] }
end
