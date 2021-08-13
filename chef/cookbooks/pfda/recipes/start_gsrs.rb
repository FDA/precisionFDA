gsrs_path = node[:gsrs_app_dir]

aws_ssm_parameter_store "get app environment" do
  path "#{node[:ssm_base_path]}/app/environment/"
  recursive true
  with_decryption true
  return_key "app_env"
  action :get_parameters_by_path
  region node[:aws_region]
end

application gsrs_path do
  owner node[:deploy_user]
  group node[:deploy_user_group]

  ruby_block "set envs" do
    block do
      node.run_state["app_env"].each do |name, val|
        ENV[name] = val
      end
    end
  end

  environment ENV.to_hash

  # create pfda.conf file
  template File.join(gsrs_path, "/conf/pfda.conf") do
    source "gsrs_pfda_conf.erb"
    variables lazy { ENV.to_hash }
  end

  # start gsrs server
  execute "start gsrs" do
    cwd gsrs_path
    user node[:deploy_user]
    command "nohup bin/ginas -J-Xmx4G -Dconfig.file=conf/pfda.conf -Dhttp.port=9000 -Djava.awt.headless=true > nohup.out 2>&1 &"
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end
end
