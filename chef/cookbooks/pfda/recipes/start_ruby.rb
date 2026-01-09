app_dir = node[:app_root_dir]
rails_dir = File.join(app_dir, 'packages', 'rails')
ruby_environment_file = '/etc/systemd/system/pfda-environment.conf'

# Run databaes migration

execute '/usr/local/bin/bundle exec rake db:migrate' do
  cwd  rails_dir
  user node[:deploy_user]
  # environment lazy { ENV.to_hash }
  # To recover from ActiveRecord::ConcurrentMigrationError when
  # deploying onto multiple instances in CodeBuild
  retries 3
  retry_delay 60
end

# Setting up puma service

systemd_unit 'pfda-puma.service' do
  content(lazy do
            {
              Unit: {
                Description: 'pFDA puma server'
              },
              Service: {
                EnvironmentFile: ruby_environment_file,
                ExecStart: '/usr/local/bin/bundle exec puma ' \
                           "-b 'ssl://127.0.0.1:3000?key=/etc/nginx/ssl/pfda.key&cert=/etc/nginx/ssl/pfda.crt' " \
                           "-e #{ENV['RAILS_ENV']}",
                ExecStop: "ps -ef | grep puma | grep -v grep | awk '{print $2}' | xargs /bin/kill -TERM",
                Restart: 'always',
                # User: node[:deploy_user],
                WorkingDirectory: rails_dir
              },
              Install: {
                WantedBy: 'multi-user.target'
              }
            }
          end)
  # user node[:deploy_user]
  action %i[create]
end

service 'pfda-puma' do
  # user node[:deploy_user]
  action %i[enable start]
end
