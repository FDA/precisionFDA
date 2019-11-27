Sidekiq.configure_server do |config|
  config.redis = { url: ENV["REDIS_WORKER_URL"], network_timeout: 5 }
  config.average_scheduled_poll_interval = 5 # default is 5
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV["REDIS_WORKER_URL"], network_timeout: 5 }
end
