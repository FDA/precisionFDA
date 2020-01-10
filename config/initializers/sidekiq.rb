redis_options = { url: ENV["REDIS_WORKER_URL"], network_timeout: 5 }
redis_options.merge!(password: ENV["REDIS_AUTH"]) if Rails.env.production?

Sidekiq.configure_server do |config|
  config.redis = redis_options
  config.average_scheduled_poll_interval = 5
end

Sidekiq.configure_client do |config|
  config.redis = redis_options
end
