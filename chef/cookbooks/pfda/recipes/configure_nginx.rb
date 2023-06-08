directory "/etc/nginx/ssl" do
  recursive true
  only_if { node.run_state["ssm_params"]["app"]["enable_ssl"] }
end

file "/etc/nginx/ssl/pfda.crt" do
  content lazy { node.run_state["ssm_params"]["app"]["ssl_configuration"]["certificate"] }
  only_if { node.run_state["ssm_params"]["app"]["enable_ssl"] }
end

file "/etc/nginx/ssl/pfda.key" do
  content lazy { node.run_state["ssm_params"]["app"]["ssl_configuration"]["private_key"] }
  only_if { node.run_state["ssm_params"]["app"]["enable_ssl"] }
end

template "/etc/nginx/nginx.conf" do
  source "nginx.conf.erb"
  variables lazy { {
    app_domain: node.run_state["ssm_params"]["app"]["domains"].split(",")[0],
    unii_host: node.run_state["ssm_params"]["app"]["environment"]["UNII_HOST"]
  } }
end

template "/etc/nginx/conf.d/json_analytics_log_format_for_prometheus.conf" do
  source "json_analytics_log_format_for_prometheus.conf.erb"
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
