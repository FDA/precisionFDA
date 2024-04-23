redis_options = { url: ENV["REDIS_WORKER_URL"], network_timeout: 5 }

if Rails.env.production? || Rails.env.staging? || Rails.env.dev?
  redis_options.merge!(password: ENV["REDIS_AUTH"])
  Redis.new(password: ENV["REDIS_AUTH"])
end

Sidekiq.configure_server do |config|
  config.redis = redis_options
  config.average_scheduled_poll_interval = 5
end

Sidekiq.configure_client do |config|
  config.redis = redis_options
end

Redis.exists_returns_integer = true
Sidekiq.strict_args!(false)
