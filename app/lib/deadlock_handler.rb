# Catches and logs any deadlock db error
module DeadlockHandler
  def self.prepended(base)
    class << base
      prepend ClassMethods
    end
  end

  module ClassMethods # rubocop:disable Style/Documentation
    DEADLOCK_ERROR_MESSAGES = [
      "Deadlock found when trying to get lock",
      "Lock wait timeout exceeded",
      "deadlock detected",
    ].freeze

    def transaction(_options = {}, &block)
      super
    rescue ActiveRecord::StatementInvalid => e
      raise unless DEADLOCK_ERROR_MESSAGES.any? { |msg| e.message =~ /#{Regexp.escape(msg)}/ }

      logger.error e.message + "\n" + innodb_deadlocks
      logger.error e.backtrace.join("\n")
    end

    private

    def innodb_deadlocks
      connection.select_one("SHOW ENGINE INNODB STATUS;")["Status"]
    rescue StandardError => e
      "Cannot get innodb status: #{e.message}"
    end
  end
end
