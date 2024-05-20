module Rats
  # Represents a failure state object
  class Failure < Result
    def initialize(value)
      @value = value
    end

    def map
      self
    end

    def flat_map
      self
    end

    def success?
      false
    end

    def failure?
      true
    end

    def fold(failure_proc, _success_proc)
      failure_proc.call(value)
    end

    alias_method :then, :flat_map
  end
end
