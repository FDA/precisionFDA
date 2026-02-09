require "exception_notifier/base_notifier"

module ExceptionNotifier
  # Custom notifier that logs unexpected errors with RAILS_UNEXPECTED_ERROR prefix
  class LoggerNotifier < BaseNotifier
    def initialize(options = {})
      super
    end

    def call(exception, _options = {})
      Rails.logger.error(
        "RAILS_UNEXPECTED_ERROR #{exception.class}: #{exception.message}\n" \
        "#{exception.backtrace&.join("\n")}",
      )
    end
  end
end
