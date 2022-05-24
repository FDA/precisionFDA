include_recipe('::configure_ssh')

app_dir = node[:rails_app_dir]
frontend_dir = File.join(app_dir, "client")
env_file = File.join(app_dir, ".env")

application app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]

  ruby_block "create .env file and set env vars" do
    block do
      File.open(env_file, "w+") do |f|
        node.run_state["ssm_params"]["app"]["environment"].each do |name, val|
          ENV[name] = val
          f << "#{name}=#{val}\n"
        end
      end

      FileUtils.chown node[:deploy_user], node[:deploy_user], env_file

      if ENV["DATABASE_URL"]
        uri = URI(ENV["DATABASE_URL"])
        uri.query = "sslca=#{node['mysql_rds_sslca_path']}"
        ENV["DATABASE_URL"] = uri.to_s

        node.run_state["ssm_params"]["app"]["database_config"] = DatabaseUrlParser.call(ENV["DATABASE_URL"])
      end

      ENV["HOME"] = "/home/#{node[:deploy_user]}"
      ENV["PATH"] = "#{node["nodejs"]["bin_path"]}:#{ENV['PATH']}"
    end
  end

  execute "Add HOST env var" do
    only_if { File.exists?(env_file) && File.foreach(env_file).grep(/HOST=/).none? }

    command %{
      echo "HOST=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" >> #{env_file}
    }
  end

  environment lazy { ENV.to_hash }

  execute "git checkout ." do
    user node[:deploy_user]
    cwd app_dir
    user node[:deploy_user]
    group node[:deploy_user]
  end

  git app_dir do
    repository lazy { node.run_state["ssm_params"]["app"]["app_source"]["url"] }
    revision lazy { node.run_state["ssm_params"]["app"]["app_source"]["revision"] }
    ssh_wrapper node[:ssh_wrapper_path]
    depth 1
    user node[:deploy_user]
  end

  execute "Install Bundler from Gemfile.lock" do
    cwd app_dir
    command %{
      version=`sed -n '/BUNDLED WITH/{n;p}' Gemfile.lock | xargs`
      if [ ! -z "$version" ]; then
        gem install --conservative bundler:${version}
      fi
    }
  end

  execute "Bundle gems" do
    command %{
      bundle config set --local without 'development test' && \
      bundle config set --local deployment 'true' && \
      bundle
    }

    cwd app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
  end

  template ::File.join(app_dir, "config", "database.yml") do
    source "database.erb"
    variables lazy {{
      rails_env: ENV.fetch("RAILS_ENV", "development"),
      config: node.run_state["ssm_params"]["app"]["database_config"] || {},
      sslca: node[:mysql_rds_sslca_path],
    }}
    user node[:deploy_user]
    group node[:deploy_user_group]
  end

  execute "/usr/local/bin/bundle exec rake db:migrate" do
    cwd  app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
    # To recover from ActiveRecord::ConcurrentMigrationError when
    # deploying onto multiple instances in CodeBuild
    retries 3
    retry_delay 60
  end

  execute "Bundle frontend" do
    only_if { File.directory?(frontend_dir) }

    # See pull request #1556 for explanation on the need to rebuild node-sass
    command %{
      export PATH=#{node[:nodejs][:prefix]}/bin:$PATH && \
      yarn --frozen-lockfile --production=false && \
      npm rebuild node-sass && \
      yarn run build:production
    }

    cwd frontend_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
  end

  execute "/usr/local/bin/bundle exec rake assets:precompile" do
    cwd  app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
  end

  execute "/usr/local/bin/bundle exec whenever --user #{node[:deploy_user]} --update-crontab" do
    cwd  app_dir
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
  end

  poise_service "puma" do
    directory app_dir
    command lazy {
      "/usr/local/bin/bundle exec puma " \
        "-b 'ssl://127.0.0.1:3000?key=/etc/nginx/ssl/pfda.key&cert=/etc/nginx/ssl/pfda.crt' " \
        "-e #{ENV['RAILS_ENV']}"
    }
    provider :systemd
    environment lazy { ENV.to_hash.merge({ "PWD" => app_dir }) }
    user node[:deploy_user]
  end

  poise_service "sidekiq" do
    directory app_dir
    command lazy {
      "/usr/local/bin/bundle exec sidekiq -e #{ENV['RAILS_ENV']} -C config/sidekiq.yml"
    }
    provider :systemd
    user node[:deploy_user]
    environment lazy { ENV.to_hash }
  end

  poise_service_options "sidekiq" do
    template "sidekiq.service.erb"
  end
end
