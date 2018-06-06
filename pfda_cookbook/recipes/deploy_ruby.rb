search('aws_opsworks_app').each do |app|
  shortname = app['shortname']
  next if shortname != 'precision_fda'

  app_dir = node['rails_app_dir']

  app['environment'].each do |name, val|
    ENV[name] = val
  end

  if ENV['DATABASE_URL']
    uri = URI(ENV['DATABASE_URL'])
    uri.query = "sslca=#{node['mysql_rds_sslca_path']}"
    ENV['DATABASE_URL'] = uri.to_s
  end

  application app_dir do
    owner node['deploy_user']
    group node['deploy_user_group']

    environment ENV.to_hash

    git app['app_source']['url'] do
      deploy_key app['app_source']['ssh_key']
      revision app['app_source']['revision']
    end

    execute "/usr/local/bin/bundle install --deployment --without development test" do
      cwd  app_dir
      user node['deploy_user']
      environment({'HOME' => "/home/#{node['deploy_user']}"})
    end

    template ::File.join(app_dir, 'config', 'database.yml') do
      source 'database.erb'
      variables({
        config: app['database'] || {},
        sslca: node['mysql_rds_sslca_path']
      })
      user node['deploy_user']
      group node['deploy_user_group']
    end

    execute "/usr/local/bin/bundle exec rake db:migrate" do
      cwd  app_dir
      user node['deploy_user']
      environment ENV.to_hash.merge({'HOME' => "/home/#{node['deploy_user']}"})
    end

    execute "/usr/local/bin/bundle exec rake assets:precompile" do
      cwd  app_dir
      user node['deploy_user']
      environment ENV.to_hash.merge({'HOME' => "/home/#{node['deploy_user']}"})
    end

    poise_service "unicorn" do
      directory app_dir
      command "/usr/local/bin/bundle exec unicorn -c config/unicorn.rb -E #{ENV['RAILS_ENV']}"
      provider :systemd
      environment ENV.to_hash
      user node['deploy_user']
    end
  end
end
