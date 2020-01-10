# Base sidekiq worker
class ApplicationWorker
  include Sidekiq::Worker

  sidekiq_options retry: 3, backtrace: 5
end
