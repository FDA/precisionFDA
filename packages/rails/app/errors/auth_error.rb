class AuthError < StandardError
  def initialize(msg, data = {})
    super(msg)
    @data = data
  end

  attr_reader :data
end
