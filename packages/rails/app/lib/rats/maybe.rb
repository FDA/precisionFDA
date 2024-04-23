module Rats
  # Represents a maybe state object
  class Maybe
    include Enumerable
  end

  # Represents a some state object
  class Some < Maybe
    def initialize(value)
      raise ArgumentError, "`value` should not be `nil`" if value.nil?

      @value = value
    end

    attr_reader :value

    def map
      Some.new(yield value)
    end

    def flat_map
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

    def ==(other)
      other.is_a?(Some) && other.value == value
    end

    alias_method :then, :flat_map
  end

  # Represents a none state object
  class None < Maybe
    def map
      self
    end

    def flat_map
      self
    end

    def has_value?
      false
    end

    def each(&block); end

    def ==(other)
      other.is_a?(None)
    end

    alias_method :then, :flat_map
  end
end
