Rails.application.config.to_prepare do
  ActiveRecord::Base.prepend(DeadlockHandler) if defined?(ActiveRecord)
end
