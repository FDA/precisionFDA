module Rats
  class Failure < Result
    def initialize(value)
      @value = value
    end

    def map(&block)
      self
    end

    def flat_map(&block)
      self
    end

    def success?
      false
    end

    def failure?
      true
    end

    def fold(failure_proc, success_proc)
      failure_proc.call(value)
    end

    alias_method :then, :flat_map
  end
end
