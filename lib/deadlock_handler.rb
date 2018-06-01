module DeadlockHandler
  def self.prepended(base)
    class << base
      prepend ClassMethods
    end
  end

  module ClassMethods
    DEADLOCK_ERROR_MESSAGES = [
      "Deadlock found when trying to get lock",
      "Lock wait timeout exceeded",
      "deadlock detected",
    ]

    def transaction(_options = {}, &block)
      super
    rescue ActiveRecord::StatementInvalid => error
      raise unless DEADLOCK_ERROR_MESSAGES.any? { |msg| error.message =~ /#{Regexp.escape(msg)}/ }

      logger.error error.message + "\n" + innodb_deadlocks
      logger.error error.backtrace.join("\n")
    end

    private

    def innodb_deadlocks
      connection.select_one("SHOW ENGINE INNODB STATUS;")["Status"]
    rescue => error
      "Cannot get innodb status: #{error.message}"
    end
  end
end
