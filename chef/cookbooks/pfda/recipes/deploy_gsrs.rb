include_recipe('::configure_ssh')

deploy_user = node[:deploy_user]
gsrs_port = node[:gsrs][:port]
gsrs_path = node[:gsrs][:app_dir]
gsrs_pfda_conf = File.join(gsrs_path, "conf/ginas-pfda.conf")
gsrs_run_script = File.join(gsrs_path, "start_gsrs.sh")
gsrs_indexes_bucket = node[:gsrs][:indexes_bucket]

ruby_block "set envs" do
  block do
    node.run_state.dig("ssm_params", "app", "environment").each do |name, val|
      ENV[name] = val
    end

    ENV["HOME"] = "/home/#{deploy_user}"
    ENV["PATH"] = "#{node["nodejs"]["bin_path"]}:#{ENV['PATH']}"
    ENV["AWS_ACCESS_KEY_ID"] = node.run_state.dig("ssm_params", "gsrs", "aws_access_key_id")
    ENV["AWS_SECRET_ACCESS_KEY"] = node.run_state.dig("ssm_params", "gsrs", "aws_secret_access_key")
  end
end

# TODO: remove GSRS dist folder from the base AMI.
execute "Remove old GSRS distribution directory" do
  command "rm -rf #{gsrs_path}"
end

git gsrs_path do
  repository node[:gsrs][:repo_url]
  revision lazy { node.run_state.dig("ssm_params", "gsrs", "revision") || node[:gsrs][:revision] }
  ssh_wrapper node[:ssh_wrapper_path]
  depth 1
  user deploy_user
  group deploy_user
end

execute "Stop G-SRS" do
  command %{
    kill `ps -eaf | \
          grep 'java -Duser.dir=#{gsrs_path}' | \
          grep -v grep | \
          awk '{print $2}'` \
    > /dev/null 2>&1 \
    || true
  }
end

template gsrs_pfda_conf do
  source "ginas-pfda.conf.erb"
  owner deploy_user
  group deploy_user
  variables lazy { ENV.to_hash }
end

template gsrs_run_script do
  source "start_gsrs.sh.erb"
  owner deploy_user
  group deploy_user
  variables(
    gsrs_path: gsrs_path,
    gsrs_pfda_conf: gsrs_pfda_conf,
    gsrs_port: gsrs_port,
    java_opts: "-J-Xmx8G",
  )
  mode 0755
end

execute "Change mode of the ginas binary" do
  cwd gsrs_path
  user deploy_user
  command "chmod 755 bin/ginas"
end

execute "Copy ginas indexes" do
  cwd gsrs_path
  user deploy_user
  command "aws s3 cp s3://#{gsrs_indexes_bucket}/ginas.ix/ ginas.ix --recursive"
  environment ENV.to_hash
end

poise_service "gsrs" do
  directory gsrs_path
  user deploy_user
  provider :systemd
  command gsrs_run_script
  environment lazy { ENV.to_hash }
end
