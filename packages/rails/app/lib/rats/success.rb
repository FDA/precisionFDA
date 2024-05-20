module Rats
  # Represents a success state object
  class Success < Result
    def initialize(value)
      @value = value
    end

    def map
      Success.new(yield value)
    end

    def flat_map
      (yield value).tap do |val|
        unless val.is_a?(Result)
          raise TypeError, "Passed block should return `Result`, it returns `#{val.class}` instead"
        end
      end
    end

    def fold(_failure_proc, success_proc)
      success_proc.call(value)
    end

    def failure?
      false
    end

    def success?
      true
    end

    alias_method :then, :flat_map
  end
end
