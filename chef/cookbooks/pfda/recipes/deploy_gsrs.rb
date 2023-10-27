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
  notifies :restart, "tomcat_service[gsrs]", :delayed
end

bash "sync ginas indexes" do
  live_stream true
  code <<-BASH
    echo "Executing: aws s3 sync $SOURCE_PATH $DESTINATION_PATH --delete"
    aws s3 sync $SOURCE_PATH $DESTINATION_PATH --delete
    chown $OWNER_USER:$OWNER_GROUP $DESTINATION_PATH/ -R
  BASH
  environment(lazy do
    {
      SOURCE_PATH: node.run_state.dig("ssm_params", "gsrs", "index_path") || node["gsrs"]["index_path"],
      DESTINATION_PATH: "#{node['gsrs']['tomcat_path']}/ginas.ix",
      OWNER_USER: node["gsrs"]["tomcat_user"],
      OWNER_GROUP: node["gsrs"]["tomcat_group"],
    }
  end)
  only_if { shell_out("aws s3 sync #{node.run_state.dig("ssm_params", "gsrs", "index_path") || node["gsrs"]["index_path"]} #{node['gsrs']['tomcat_path']}/ginas.ix --delete --dryrun | grep download").exitstatus == 0 }
  notifies :run, "bash[wipe tomcat cache]", :immediately
end

git "#{node[:gsrs][:tomcat_path]}/repo" do
  repository node[:gsrs][:repo_url]
  revision(lazy { node.run_state.dig("ssm_params", "gsrs", "revision") || node[:gsrs][:revision] })
  depth 1
  notifies :run, "bash[copy gsrs to webapps]", :immediately
end

bash "copy gsrs to webapps" do
  action :nothing
  live_stream true
  code <<-BASH
    rsync -a $SOURCE_PATH $DESTINATION_PATH \
    --exclude '.git' \
    --exclude 'ROOT/WEB-INF/classes/application.yml' \
    --exclude 'frontend/WEB-INF/classes/static/assets/data/config.json' \
    --exclude 'substances/WEB-INF/classes/application.conf' \
    --exclude 'substances/WEB-INF/classes/codeSystem.json'
    chown $OWNER_USER:$OWNER_GROUP $DESTINATION_PATH/ -R
  BASH
  environment(
    {
      SOURCE_PATH: "#{node[:gsrs][:tomcat_path]}/repo/",
      DESTINATION_PATH: "#{node[:gsrs][:tomcat_path]}/webapps",
      OWNER_USER: node["gsrs"]["tomcat_user"],
      OWNER_GROUP: node["gsrs"]["tomcat_group"],
    },
  )
  notifies :run, "bash[wipe tomcat cache]", :immediately
end

bash "wipe tomcat cache" do
  action :nothing
  code <<-BASH
    rm -rf $DESTINATION_PATH
  BASH
  environment(
    {
      DESTINATION_PATH: "#{node['gsrs']['tomcat_path']}/work/*",
    }
  )
  notifies :restart, "tomcat_service[gsrs]", :delayed
end

template "#{node[:gsrs][:tomcat_path]}/webapps/ROOT/WEB-INF/classes/application.yml" do
  source "gsrs/application.yml.erb"
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  mode 0644
  notifies :restart, "tomcat_service[gsrs]", :delayed
end

template "#{node[:gsrs][:tomcat_path]}/webapps/frontend/WEB-INF/classes/static/assets/data/config.json" do
  source "gsrs/config.json.erb"
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  mode 0644
  variables(
    HOST: lazy { node.run_state.dig("ssm_params", "app", "environment", "HOST") },
  )
  notifies :restart, "tomcat_service[gsrs]", :delayed
end

template "#{node[:gsrs][:tomcat_path]}/webapps/substances/WEB-INF/classes/codeSystem.json" do
  source "gsrs/codeSystem.json.erb"
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  mode 0644
  notifies :restart, "tomcat_service[gsrs]", :delayed
end

template "#{node[:gsrs][:tomcat_path]}/webapps/substances/WEB-INF/classes/application.conf" do
  source "gsrs/application.conf.erb"
  sensitive true
  mode 0644
  owner node[:gsrs][:tomcat_user]
  group node[:gsrs][:tomcat_grop]
  variables(
    TOMCAT_PATH: node[:gsrs][:tomcat_path],
    GSRS_AUTHENTICATION_HEADER_NAME: lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_AUTHENTICATION_HEADER_NAME") },
    GSRS_AUTHENTICATION_HEADER_NAME_EMAIL: lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_AUTHENTICATION_HEADER_NAME_EMAIL") },
    GSRS_DATABASE_URL: lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_DATABASE_URL") },
    GSRS_DATABASE_USERNAME: lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_DATABASE_USERNAME") },
    GSRS_DATABASE_PASSWORD: lazy { node.run_state.dig("ssm_params", "app", "environment", "GSRS_DATABASE_PASSWORD") },
    HOST: lazy { node.run_state.dig("ssm_params", "app", "environment", "HOST") },
  )
  notifies :restart, "tomcat_service[gsrs]", :delayed
end

tomcat_service "gsrs" do
  action [:start, :enable]
  service_name "gsrs"
  install_path node[:gsrs][:tomcat_path]
  tomcat_user node[:gsrs][:tomcat_user]
  tomcat_group node[:gsrs][:tomcat_group]
  env_vars(lazy do
    [
      CATALINA_PID: "#{node[:gsrs][:tomcat_path]}/bin/tomcat.pid",
      CATALINA_OPTS: node.run_state.dig("ssm_params", "gsrs", "catalina_opts") || node[:gsrs][:catalina_opts],
      JAVA_OPTS: "-Djdk.util.zip.disableZip64ExtraFieldValidation=true",
    ]
  end)
  only_if { node.run_state.dig("ssm_params", "app", "environment", "GSRS_ENABLED") == "1" && node[:gsrs][:tomcat_start] }
end
