class BaseService
  class << self
    def call(*attrs)
      new(*attrs).call
    end
  end

  def initialize(context)
    @context = context
  end

  protected

  attr_reader :context

  def api
    @api ||= DNAnexusAPI.new(context.token)
  end
end
