# Common code to deal with successes, failures, etc.
module Rats
  def self.try
    Ok.new(yield)
  rescue StandardError => e
    Error.new(e)
  end

  def self.success(value)
    Success.new(value)
  end

  def self.failure(error)
    Failure.new(error)
  end

  def self.some(value)
    Some.new(value)
  end

  def self.none
    None.new
  end

  def self.ok(value)
    Ok.new(value)
  end

  def self.error(err)
    Error.new(err)
  end
end
