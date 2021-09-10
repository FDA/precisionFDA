include_recipe('::configure_ssh')

gsrs_port = node[:gsrs][:port]
gsrs_src_path = node[:gsrs][:app_src_dir]
gsrs_dist_path = node[:gsrs][:app_dist_dir]
pfda_src_conf = File.join(gsrs_src_path, "modules/ginas/conf/ginas-pfda.conf")
pfda_dist_conf = File.join(gsrs_dist_path, "conf/ginas-pfda.conf")
# gsrs_dist_zip = File.join(gsrs_src_path, "modules/ginas/target/universal/ginas-*.zip")

aws_ssm_parameter_store "get params" do
  path "#{node[:ssm_base_path]}/"
  recursive true
  with_decryption true
  return_key "params"
  action :get_parameters_by_path
  region node[:aws_region]
end

ruby_block "set envs" do
  block do
    node.run_state.dig("params", "app", "environment").each do |name, val|
      ENV[name] = val
    end

    ENV["HOME"] = "/home/#{node[:deploy_user]}"
    ENV["PATH"] = "#{node["nodejs"]["bin_path"]}:#{ENV['PATH']}"
  end
end

git gsrs_src_path do
  repository node[:gsrs][:repo_url]
  revision lazy { node.run_state.dig("params", "gsrs", "revision") || node[:gsrs][:revision] }
  ssh_wrapper node[:ssh_wrapper_path]
  depth 1
  user node[:deploy_user]
  group node[:deploy_user]
end

execute "Stop G-SRS" do
  command %{
    kill `ps -eaf | \
          grep 'java -Duser.dir=#{gsrs_dist_path}' | \
          grep -v grep | \
          awk '{print $2}'` \
    > /dev/null 2>&1 \
    || true
  }
end

# this should be executed by root
execute "Remove old GSRS dist folder and package" do
  command %{
    sudo bash -c "echo fs.file-max = 999999 >> /etc/sysctl.conf" && \
    sysctl -p && \
    rm -rf #{gsrs_dist_path}
  }
end

execute "Build G-SRS self-contained distribution" do
  cwd gsrs_src_path
  user node[:deploy_user]
  group node[:deploy_user]

  command %{
    cd /home/#{node[:deploy_user]} && \
    cp -R #{gsrs_src_path} #{gsrs_dist_path} && \
    chmod 755 #{gsrs_dist_path}/bin/ginas
  }
  environment lazy { ENV.to_hash }
end

template pfda_dist_conf do
  source "ginas-pfda.conf.erb"
  variables lazy { ENV.to_hash }
end

execute "Run G-SRS" do
  cwd gsrs_dist_path
  user node[:deploy_user]
  group node[:deploy_user]

  command %{
    rm -f RUNNING_PID && \
    nohup bin/ginas \
      -J-Xmx4G \
      -Dconfig.file=#{pfda_dist_conf} \
      -Dhttp.port=#{gsrs_port} \
      -Djava.awt.headless=true > nohup.out 2>&1 &
  }
  environment lazy { ENV.to_hash }
end
