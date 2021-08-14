environment ENV["RAILS_ENV"] || "production"
threads 2, 16
port 3000
workers ENV.fetch("WEB_CONCURRENCY", 4).to_i
stdout_redirect File.expand_path("../log/puma.log", __dir__),
                File.expand_path("../log/puma-err.log", __dir__)

preload_app!

before_fork do
  Auditor.init!

  ActiveRecord::Base.connection.disconnect! if defined?(ActiveRecord::Base)
end

after_worker_fork do
  if defined?(ActiveRecord::Base)
    ActiveRecord::Base.establish_connection(
      ENV.fetch("DATABASE_URL", Rails.application.config.database_configuration[Rails.env]),
    )
  end
end
