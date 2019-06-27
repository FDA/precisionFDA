module Rats
  class Maybe
    include Enumerable
  end

  class Some < Maybe
    def initialize(value)
      raise ArgumentError, "`value` should not be `nil`" unless value != nil
      @value = value
    end

    def value
      @value
    end

    def map(&block)
      Some.new(yield value)
    end

    def flat_map(&block)
      val = yield value
      unless val.is_a?(Maybe)
        raise TypeError, "Passed block should return `Maybe`, it returned `#{val.class}` instead"
      end
      val
    end

    def has_value?
      true
    end

    def each(&block)
      block.call(value)
    end

    def ==(obj)
      obj.is_a?(Some) && obj.value == value
    end

    alias_method :then, :flat_map
  end

  class None < Maybe
    def map(&block)
      self
    end

    def flat_map(&block)
      self
    end

    def has_value?
      false
    end

    def each(&block)
    end

    def ==(obj)
      obj.is_a?(None)
    end

    alias_method :then, :flat_map
  end
end
