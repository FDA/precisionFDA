template '/etc/nginx/nginx.conf' do
  source 'gsrs/nginx.conf.erb'
  variables(lazy do
              {
                gsrs_host: node.run_state["ssm_params"]["app"]["environment"]["GSRS_URL"],
              }
            end)
end

template '/etc/nginx/conf.d/json_analytics_log_format_for_prometheus.conf' do
  source 'json_analytics_log_format_for_prometheus.conf.erb'
end

service 'nginx' do
  action :restart
end
