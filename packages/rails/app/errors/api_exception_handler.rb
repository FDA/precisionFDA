# graceful exception handling for API responses
module ApiExceptionHandler
  extend ActiveSupport::Concern

  class Error < StandardError; end

  class NotFound < StandardError; end

  included do
    rescue_from ApiExceptionHandler::Error, with: :error
    rescue_from ApiExceptionHandler::NotFound, with: :error
    rescue_from ActiveRecord::ConnectionTimeoutError, with: :handle_connection_timeout
  end

  private

  def handle_connection_timeout(error)
    Rails.logger.error(ActiveRecord::Base.connection_pool.stat)
    Rails.logger.error("listing #{Thread.list.count} threads:")
    Thread.list.each_with_index do |thread, index|
      Rails.logger.error("---- thread #{index}: #{thread.inspect}")
      Rails.logger.error(thread.backtrace.take(5))
    end
    raise error
  end

  def error(error)
    ApiError.new error
  end
end
