module DeadlockHandler
  def self.included(base)
    base.extend(ClassMethods)
    base.class_eval do
      class << self
        alias_method_chain :transaction, :deadlock_handling
      end
    end
  end

  module ClassMethods
    DEADLOCK_ERROR_MESSAGES = [
      "Deadlock found when trying to get lock",
      "Lock wait timeout exceeded",
      "deadlock detected",
    ]

    def transaction_with_deadlock_handling(*objects, &block)
      transaction_without_deadlock_handling(*objects, &block)
    rescue ActiveRecord::StatementInvalid => error
      raise unless DEADLOCK_ERROR_MESSAGES.any? { |msg| error.message =~ /#{Regexp.escape(msg)}/ }

      raise error, error.message + "\n" + innodb_deadlocks, error.backtrace
    end

    private

    def innodb_deadlocks
      connection.select_one("SHOW ENGINE INNODB STATUS;")["Status"]
    rescue => error
      "Cannot get innodb status: #{error.message}"
    end
  end
end
