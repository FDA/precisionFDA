# graceful exception handling for API responses
module ApiExceptionHandler
  extend ActiveSupport::Concern

  class Error < StandardError; end
  class NotFound < StandardError; end

  included do
    rescue_from ApiExceptionHandler::Error, with: :error
    rescue_from ApiExceptionHandler::NotFound, with: :error
  end

  private

  def error(error)
    ApiError.new error
  end
end
