class ApiError < StandardError
  def initialize(msg, data)
    super(msg)
    @data = data
  end

  attr_reader :data
end
