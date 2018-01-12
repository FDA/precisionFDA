require "rats/version"
require 'rats/maybe'
require 'rats/try'
require 'rats/result'

module Rats
  def self.try(&block)
    begin
      Ok.new(yield)
    rescue => e
      Error.new(e)
    end
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
