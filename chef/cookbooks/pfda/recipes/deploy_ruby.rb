include_recipe('::configure_ssh')

app_dir = node[:app_root_dir]
app_log_dir = File.join(app_dir, 'log')
rails_dir = File.join(app_dir, 'packages', 'rails')
env_file = File.join(rails_dir, '.env')

directory app_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]
end

git app_dir do
  repository(lazy { node.run_state['ssm_params']['app']['app_source']['url'] })
  revision(lazy { node.run_state['ssm_params']['app']['app_source']['revision'] })
  ssh_wrapper node[:ssh_wrapper_path]
  depth 1
  user node[:deploy_user]
end

directory app_log_dir do
  owner node[:deploy_user]
  group node[:deploy_user_group]
end

link '/var/log/precision_fda' do
  to app_log_dir
  link_type :symbolic
end

ruby_block 'create .env file and set env vars' do
  block do
    File.open(env_file, 'w+') do |f|
      node.run_state['ssm_params']['app']['environment'].each do |name, val|
        ENV[name] = val
        f << "#{name}=#{val}\n"
      end
      f << "ADMIN_TOKEN=#{node.run_state.dig('ssm_params', 'app', 'secrets')&.fetch('ADMIN_TOKEN', nil)}\n"
    end

    FileUtils.chown node[:deploy_user], node[:deploy_user], env_file

    if ENV['DATABASE_URL']
      uri = URI(ENV['DATABASE_URL'])
      uri.query = "sslca=#{node['mysql_rds_sslca_path']}"
      ENV['DATABASE_URL'] = uri.to_s

      node.run_state['ssm_params']['app']['database_config'] = DatabaseUrlParser.call(ENV['DATABASE_URL'])
    end

    ENV['HOME'] = "/home/#{node[:deploy_user]}"
  end
end

execute 'Add HOST env var' do
  only_if { File.exist?(env_file) && File.foreach(env_file).grep(/HOST=/).none? }

  command %{
    echo "HOST=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" >> #{env_file}
  }
end

template ::File.join(rails_dir, 'public', 'robots.txt') do
  source 'robots.txt.erb'
  user node[:deploy_user]
  group node[:deploy_user_group]
end

execute 'Install Bundler from Gemfile.lock' do
  cwd rails_dir
  command %(
    version=`sed -n '/BUNDLED WITH/{n;p}' Gemfile.lock | xargs`
    if [ ! -z "$version" ]; then
      gem install --conservative bundler:${version}
    fi
  )
end

execute 'Bundle gems' do
  cwd rails_dir
  command %(
    bundle config set --local without 'development test' && \
    bundle config set --local deployment 'true' && \
    bundle
  )
  user node[:deploy_user]
end

execute 'Install bower dependencies' do
  cwd rails_dir
  command %(
    bower install
  )
  user node[:deploy_user]
end

template ::File.join(rails_dir, 'config', 'database.yml') do
  source 'database.erb'
  user node[:deploy_user]
  group node[:deploy_user_group]
  sensitive true
  variables(lazy do
              {
                rails_env: ENV.fetch('RAILS_ENV', 'development'),
                config: node.run_state['ssm_params']['app']['database_config'] || {},
                dbpool: node.run_state['ssm_params']['app']['environment']['DB_POOL'] || 20,
                sslca: node[:mysql_rds_sslca_path]
              }
            end)
end

execute 'Install node deps' do
  cwd app_dir
  command %(
    pnpm i --frozen-lockfile --prod=false --filter=pfda-frontend
  )
  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end

execute 'Build frontend' do
  cwd app_dir
  command %(
    pnpm run build --filter=pfda-frontend
  )
  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end

execute '/usr/local/bin/bundle exec rake assets:precompile' do
  cwd  rails_dir
  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end

execute "/usr/local/bin/bundle exec whenever --user #{node[:deploy_user]} --update-crontab" do
  cwd  rails_dir
  user node[:deploy_user]
  environment(lazy { ENV.to_hash })
end

execute 'Workaround for running systemctl as root' do
  cwd app_dir
  command %(
    git config --global --add safe.directory '*'
  )
end

ruby_environment_file = '/etc/systemd/system/pfda-environment.conf'

template ruby_environment_file do
  source 'environment.erb'
  user 'root'
  group 'root'
end
