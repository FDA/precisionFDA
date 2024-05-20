# Error logger
# The level of this logger cannot be changed, which is the reason why this logger exists
#
# This is due to the code on line 53 in file bootstrap.rb:
#  - Rails.logger.level = ActiveSupport::Logger.const_get(config.log_level.to_s.upcase)
#  - We want to have two loggers with two different log levels
class ErrorLogger < ActiveSupport::Logger
  def initialize(*args, **kwargs)
    super
    @level = ActiveSupport::Logger::ERROR
  end

  def level=(_severity)
    super(ActiveSupport::Logger::ERROR)
  end
end
