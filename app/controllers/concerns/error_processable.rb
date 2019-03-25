module ErrorProcessable
  extend ActiveSupport::Concern

  included do
    rescue_from ApiError, with: :render_error_method
  end

  def render_error_method(error)
    json = { error: { type: "API Error", message: error.message } }
    json[:data] = error.data unless error.data.empty?
    render json: json, status: 422
  end

  def fail(msg, data = {})
    raise ApiError.new(msg, data)
  end
end