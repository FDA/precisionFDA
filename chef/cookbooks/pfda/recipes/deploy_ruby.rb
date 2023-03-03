include_recipe('::configure_ssh')

app_dir = node[:rails_app_dir]
frontend_dir = File.join(app_dir, "client")
env_file = File.join(app_dir, ".env")

directory app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]
end

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

template ::File.join(app_dir, "public", "robots.txt") do
  source "robots.txt.erb"
  user node[:deploy_user]
  group node[:deploy_user_group]
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
  # environment lazy { ENV.to_hash }
end

execute "Install bower dependencies" do
  command %{
    bower install
  }

  cwd app_dir
  user node[:deploy_user]
end

template ::File.join(app_dir, "config", "database.yml") do
  source "database.erb"
  variables lazy {{
    rails_env: ENV.fetch("RAILS_ENV", "development"),
    config: node.run_state["ssm_params"]["app"]["database_config"] || {},
    dbpool: node.run_state["ssm_params"]["app"]["environment"]["DB_POOL"] || 20,
    sslca: node[:mysql_rds_sslca_path],
  }}
  user node[:deploy_user]
  group node[:deploy_user_group]
end

execute "/usr/local/bin/bundle exec rake db:migrate" do
  cwd  app_dir
  user node[:deploy_user]
  # environment lazy { ENV.to_hash }
  # To recover from ActiveRecord::ConcurrentMigrationError when
  # deploying onto multiple instances in CodeBuild
  retries 3
  retry_delay 60
end

execute "Bundle frontend" do
  only_if { File.directory?(frontend_dir) }

  command %{
    export PATH=#{node[:nodejs][:prefix]}/bin:$PATH && \
    yarn --frozen-lockfile --production=false && \
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

# This is related to creating system services instead of user services
# We should move to systemctl --user once we figure out the issue of running it as user deploy
execute "Workaround for running systemctl as root" do
  cwd app_dir
  command %{
    git config --global --add safe.directory '*'
  }
end

# Setting up puma service

ruby_environment_file = "/etc/systemd/system/pfda-environment.conf"

template ruby_environment_file do
  source "environment.erb"
  user 'root'
  group 'root'
end

systemd_unit "pfda-puma.service" do
  content lazy { {
    Unit: {
      Description: 'pFDA puma server',
    },
    Service: {
      EnvironmentFile: "#{ruby_environment_file}",
      ExecStart: "/usr/local/bin/bundle exec puma " \
                 "-b 'ssl://127.0.0.1:3000?key=/etc/nginx/ssl/pfda.key&cert=/etc/nginx/ssl/pfda.crt' " \
                 "-e #{ENV['RAILS_ENV']}",
      ExecStop: "ps -ef | grep puma | grep -v grep | awk '{print $2}' | xargs /bin/kill -TERM",
      Restart: 'always',
      # User: node[:deploy_user],
      WorkingDirectory: app_dir
    },
    Install: {
      WantedBy: 'multi-user.target'
    }
  } }
  #user node[:deploy_user]
  action [:create, :enable]
end

  service "pfda-puma" do
    #user node[:deploy_user]
    action [:enable, :start]
  end


# Setting up sidekiq service

sidekiq_unit_path = "/etc/systemd/system/pfda-sidekiq.service"

systemd_unit "pfda-sidekiq.service" do
  content lazy { {
    Unit: {
      Description: 'pFDA sidekiq service',
    },
    Service: {
      EnvironmentFile: "#{ruby_environment_file}",
      ExecStartPre: "/bin/bash -c 'rm /srv/www/precision_fda/current/log/sidekiq.log'",
      ExecStart: "/usr/local/bin/bundle exec sidekiq -e #{ENV['RAILS_ENV']} -C #{app_dir}/config/sidekiq.yml",
      ExecStop: "ps -ef | grep sidekiq | grep -v grep | awk '{print $2}' | xargs kill -TERM",
      Restart: 'always',
      StandardOutput: "file:/srv/www/precision_fda/current/log/sidekiq.log",
      StandardError: "file:/srv/www/precision_fda/current/log/sidekiq.log",
      SyslogIdentifier: "sidekiq",
      WorkingDirectory: app_dir
      # User: node[:deploy_user]
    },
    Install: {
      WantedBy: 'multi-user.target'
    }
  } }
  action [:create, :enable]
end

service "pfda-sidekiq" do
  #user node[:deploy_user]
  action :start
end
