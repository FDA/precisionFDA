node[:gsrs][:packages].each do |p|
  package p do
    action :install
  end
end

tomcat_install "gsrs" do
  symlink_path node[:gsrs][:tomcat_path]
  version node[:gsrs][:tomcat_version]
  tomcat_user node[:gsrs][:tomcat_user]
  tomcat_group node[:gsrs][:tomcat_group]
  exclude_docs true
  exclude_examples true
  exclude_manager true
  exclude_hostmanager true
end

template "#{node[:gsrs][:tomcat_path]}/conf/context.xml" do
  source "gsrs/context.xml"
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  mode 0600
end

bash "sync ginas indexes" do
  code <<-EOH
  aws s3 sync #{node.run_state.dig("ssm_params", "gsrs", "index_path") || node[:gsrs][:index_path]} #{node[:gsrs][:tomcat_path]}/ginas.ix --delete
  chown #{node[:gsrs][:tomcat_user]}:#{node[:gsrs][:tomcat_group]} #{node[:gsrs][:tomcat_path]}/ginas.ix/ -R
  EOH
end

git "#{node[:gsrs][:tomcat_path]}/repo" do
  repository node[:gsrs][:repo_url]
  revision lazy { node.run_state.dig("ssm_params", "gsrs", "revision") || node[:gsrs][:revision] }
  depth 1
end

bash "copy gsrs to webapps" do
  code <<-EOH
  rsync -a #{node[:gsrs][:tomcat_path]}/repo/ #{node[:gsrs][:tomcat_path]}/webapps \
  --exclude '.git' \
  --exclude 'ROOT/WEB-INF/classes/application.yml' \
  --exclude 'frontend/WEB-INF/classes/static/assets/data/config.json' \
  --exclude 'substances/WEB-INF/classes/application.conf' \
  --exclude 'substances/WEB-INF/classes/codeSystem.json'
  chown #{node[:gsrs][:tomcat_user]}:#{node[:gsrs][:tomcat_group]} #{node[:gsrs][:tomcat_path]}/webapps/ -R
  EOH
end

template "#{node[:gsrs][:tomcat_path]}/webapps/ROOT/WEB-INF/classes/application.yml" do
  source "gsrs/application.yml.erb"
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  mode 0644
end

template "#{node[:gsrs][:tomcat_path]}/webapps/frontend/WEB-INF/classes/static/assets/data/config.json" do
  source "gsrs/config.json.erb"
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  mode 0644
  variables(
    :HOST => lazy { node.run_state.dig("ssm_params", "app", "environment", "HOST") },
  )
end

template "#{node[:gsrs][:tomcat_path]}/webapps/substances/WEB-INF/classes/codeSystem.json" do
  source "gsrs/codeSystem.json.erb"
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  mode 0644
end

template "#{node[:gsrs][:tomcat_path]}/webapps/substances/WEB-INF/classes/application.conf" do
  source "gsrs/application.conf.erb"
  mode 0644
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  variables(
    :TOMCAT_PATH => node[:gsrs][:tomcat_path],
    :GSRS_AUTHENTICATION_HEADER_NAME => lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_AUTHENTICATION_HEADER_NAME") },
    :GSRS_AUTHENTICATION_HEADER_NAME_EMAIL => lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_AUTHENTICATION_HEADER_NAME_EMAIL") },
    :GSRS_DATABASE_URL => lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_DATABASE_URL") },
    :GSRS_DATABASE_USERNAME => lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_DATABASE_USERNAME") },
    :GSRS_DATABASE_PASSWORD => lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_DATABASE_PASSWORD") },
    :HOST => lazy { node.run_state.dig("ssm_params", "app", "environment", "HOST") },
  )
end

if node[:gsrs][:tomcat_start]
  tomcat_service "gsrs" do
    action :start
    service_name "gsrs"
    install_path node[:gsrs][:tomcat_path]
    tomcat_user node[:gsrs][:tomcat_user]
    tomcat_group node[:gsrs][:tomcat_group]
    env_vars [
               { "CATALINA_PID" => node[:gsrs][:tomcat_path] + "/bin/tomcat.pid" },
               { "CATALINA_OPTS" => "-Xms" + node[:gsrs][:tomcat_memory_min] + " -Xmx" + node[:gsrs][:tomcat_memory_max] },
             ]
  end
end
