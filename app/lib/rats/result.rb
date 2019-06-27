module Rats
  class Result
    attr_reader :value

    def ==(obj)
      obj.class == self.class && obj.value == value
    end
  end

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

  class Success < Result
    def initialize(value)
      @value = value
    end

    def map(&block)
      Success.new(yield value)
    end

    def flat_map(&block)
      (yield value).tap do |val|
        raise TypeError, "Passed block should return `Result`, it returned `#{val.class}` instead" unless val.is_a?(Result)
      end
    end

    def fold(failure_proc, success_proc)
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
