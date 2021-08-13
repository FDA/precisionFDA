aws_ssm_parameter_store "get nginx params" do
  path "#{node[:ssm_base_path]}/app/"
  recursive true
  with_decryption true
  return_key "app"
  action :get_parameters_by_path
  region node[:aws_region]
end

directory "/etc/nginx/ssl" do
  recursive true
  only_if { node.run_state["app"]["enable_ssl"] }
end

file "/etc/nginx/ssl/pfda.crt" do
  content lazy { node.run_state["app"]["ssl_configuration"]["certificate"] }
  only_if { node.run_state["app"]["enable_ssl"] }
end

file "/etc/nginx/ssl/pfda.key" do
  content lazy { node.run_state["app"]["ssl_configuration"]["private_key"] }
  only_if { node.run_state["app"]["enable_ssl"] }
end

template "/usr/local/conf/nginx.conf" do
  source "nginx.conf.erb"
  variables lazy { { app_domain: node.run_state["app"]["domains"].split(",")[0] } }
end

template "/usr/local/conf/modsecurity.conf" do
  source "modsecurity.erb"
end

template "/usr/local/conf/pfda_modsec_rules.conf" do
  source "pfda_modsec_rules.erb"
end

service "nginx" do
  action :restart
end
