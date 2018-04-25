ActiveRecord::Base.send(:include, DeadlockHandler) if defined?(ActiveRecord)
