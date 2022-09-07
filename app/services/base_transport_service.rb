# Base service class to bind domain with transport layer
class BaseTransportService
  STATUS = {
    success: :success,
    error: :error,
    warning: :warning,
  }.freeze

  attr_reader :response
  attr_accessor :status

  class << self
    def call(*attrs)
      new(*attrs).call
    end
  end

  def initialize(params, context, scope = "")
    @params = params
    @context = context
    @scope = scope
    @response = { data: [], errors: [] }
    @status = STATUS[:error]
  end

  def call
    raise NotImplementedError, "#call is not implemented for #{self.class}"
  end

  def success?
    status == STATUS[:success]
  end

  def message
    "You are using #{self.class}##{__method__} method"
  end

  protected

  attr_reader :context, :params

  def api
    @api ||= DNAnexusAPI.new(context.token)
  end
end
