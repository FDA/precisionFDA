ActiveRecord::Base.prepend(DeadlockHandler) if defined?(ActiveRecord)
