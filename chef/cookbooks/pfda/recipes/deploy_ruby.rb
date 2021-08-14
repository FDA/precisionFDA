aws_ssm_parameter_store "get app params" do
  path "#{node[:ssm_base_path]}/app/"
  recursive true
  with_decryption true
  return_key "app"
  action :get_parameters_by_path
  region node[:aws_region]
end

app_dir = node[:rails_app_dir]
frontend_dir = File.join(app_dir, "client")
key_path = "/home/#{node[:deploy_user]}/.ssh/id_rsa"
ssh_wrapper_path = "/tmp/wrap-ssh4git.sh"
env_file = File.join(app_dir, ".env")

application app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]

  ruby_block "create .env file and set env vars" do
    block do
      File.open(env_file, "w+") do |f|
        node.run_state["app"]["environment"].each do |name, val|
          ENV[name] = val
          f << "#{name}=#{val}\n"
        end
      end

      FileUtils.chown node[:deploy_user], node[:deploy_user], env_file

      if ENV["DATABASE_URL"]
        uri = URI(ENV["DATABASE_URL"])
        uri.query = "sslca=#{node['mysql_rds_sslca_path']}"
        ENV["DATABASE_URL"] = uri.to_s

        node.run_state["app"]["database_config"] = DatabaseUrlParser.call(ENV["DATABASE_URL"])
      end
    end
  end

  execute "Add DEV_HOST env var" do
    only_if {
      File.exists?(env_file) &&
        File.foreach(env_file).grep(/DEV_HOST=/).none? &&
        !%w(production staging).include?(node.environment)
    }

    command %{
      echo "DEV_HOST=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" >> #{env_file}
    }
  end

  execute 'export PATH="$(npm bin -g):$PATH"' do
    user node[:deploy_user]
  end

  environment lazy { ENV.to_hash }

  file key_path do
    content lazy { node.run_state["app"]["app_source"]["ssh_key"] }
    mode 0600
  end

  template ssh_wrapper_path do
    source "wrap-ssh4git.sh.erb"
    variables key_path: key_path
    owner node[:deploy_user]
    mode 0700
  end

  execute "git checkout ." do
    cwd app_dir
  end

  git app_dir do
    repository lazy { node.run_state["app"]["app_source"]["url"] }
    revision lazy { node.run_state["app"]["app_source"]["revision"] }
    ssh_wrapper ssh_wrapper_path
    depth 1
    user node[:deploy_user]
  end

  execute "Bundle gems" do
    command %{
      bundle config set --local without 'development test' && \
      bundle config set --local deployment 'true' && \
      bundle
    }

    cwd app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  template ::File.join(app_dir, "config", "database.yml") do
    source "database.erb"
    variables lazy {{
      rails_env: ENV.fetch("RAILS_ENV", "development"),
      config: node.run_state["app"]["database_config"] || {},
      sslca: node[:mysql_rds_sslca_path],
    }}
    user node[:deploy_user]
    group node[:deploy_user_group]
  end

  execute "/usr/local/bin/bundle exec rake db:migrate" do
    cwd  app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  execute "Bundle frontend" do
    only_if { File.directory?(frontend_dir) }

    command %{
      export PATH=#{node[:nodejs][:prefix]}/bin:$PATH && \
      yarn --frozen-lockfile && \
      yarn run build:production
    }

    cwd frontend_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  execute "/usr/local/bin/bundle exec rake assets:precompile" do
    cwd  app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  execute "/usr/local/bin/bundle exec whenever --user #{node[:deploy_user]} --update-crontab" do
    cwd  app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end

  poise_service "puma" do
    directory app_dir
    command lazy {
      "/usr/local/bin/bundle exec puma " \
        "-b 'ssl://127.0.0.1:3000?key=/etc/nginx/ssl/pfda.key&cert=/etc/nginx/ssl/pfda.crt' " \
        "-e #{ENV['RAILS_ENV']}"
    }
    provider :systemd
    environment lazy {
      ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}", "PWD" => app_dir })
    }
    user node[:deploy_user]
  end

  poise_service "sidekiq" do
    directory app_dir
    command lazy { "/usr/local/bin/bundle exec sidekiq -e #{ENV['RAILS_ENV']} -C config/sidekiq.yml" }
    provider :systemd
    user node[:deploy_user]
    environment lazy { ENV.to_hash.merge({ "HOME" => "/home/#{node[:deploy_user]}" }) }
  end
end
