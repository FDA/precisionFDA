app_dir = node[:rails_app_dir]
ruby_environment_file = "/etc/systemd/system/pfda-environment.conf"

# Run databaes migration

execute "/usr/local/bin/bundle exec rake db:migrate" do
  cwd  app_dir
  user node[:deploy_user]
  # environment lazy { ENV.to_hash }
  # To recover from ActiveRecord::ConcurrentMigrationError when
  # deploying onto multiple instances in CodeBuild
  retries 3
  retry_delay 60
end

# Setting up puma service

systemd_unit "pfda-puma.service" do
  content(lazy do
            {
              Unit: {
                Description: "pFDA puma server",
              },
              Service: {
                EnvironmentFile: ruby_environment_file,
                ExecStart: "/usr/local/bin/bundle exec puma " \
                           "-b 'ssl://127.0.0.1:3000?key=/etc/nginx/ssl/pfda.key&cert=/etc/nginx/ssl/pfda.crt' " \
                           "-e #{ENV['RAILS_ENV']}",
                ExecStop: "ps -ef | grep puma | grep -v grep | awk '{print $2}' | xargs /bin/kill -TERM",
                Restart: "always",
                # User: node[:deploy_user],
                WorkingDirectory: app_dir,
              },
              Install: {
                WantedBy: "multi-user.target",
              },
            }
          end)
  # user node[:deploy_user]
  action %i(create)
end

service "pfda-puma" do
  # user node[:deploy_user]
  action %i(enable start)
end

# Setting up sidekiq service

systemd_unit "pfda-sidekiq.service" do
  content(lazy do
            {
              Unit: {
                Description: "pFDA sidekiq service",
              },
              Service: {
                EnvironmentFile: ruby_environment_file,
                ExecStartPre: "/bin/bash -c 'rm /srv/www/precision_fda/current/log/sidekiq.log'",
                ExecStart: "/usr/local/bin/bundle exec sidekiq -e #{ENV['RAILS_ENV']} -C #{app_dir}/config/sidekiq.yml",
                ExecStop: "ps -ef | grep sidekiq | grep -v grep | awk '{print $2}' | xargs kill -TERM",
                Restart: "always",
                StandardOutput: "file:/srv/www/precision_fda/current/log/sidekiq.log",
                StandardError: "file:/srv/www/precision_fda/current/log/sidekiq.log",
                SyslogIdentifier: "sidekiq",
                WorkingDirectory: app_dir,
                # User: node[:deploy_user]
              },
              Install: {
                WantedBy: "multi-user.target",
              },
            }
          end)
  action %i(create)
end

service "pfda-sidekiq" do
  # user node[:deploy_user]
  action %i(enable start)
end
