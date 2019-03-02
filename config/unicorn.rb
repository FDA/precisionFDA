listen 3000, backlog: 1024, tcp_nodelay: true, tcp_nopush: false, tries: 5, delay: 0.5
worker_processes ENV.fetch('WEB_CONCURRENCY', 4).to_i
timeout 30
preload_app true

before_fork do |server, worker|
  Auditor.init!
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.connection.disconnect!
  end
end

after_fork do |server, worker|
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.establish_connection(
      ENV.fetch('DATABASE_URL', Rails.application.config.database_configuration[Rails.env])
    )
  end
end
