module Rats
  class Try
  end

  # Represents an OK state object
  class Ok < Try
    attr_accessor :value

    def initialize(value)
      @value = value
    end

    def map
      Ok.new(yield value)
    rescue StandardError => e
      Error.new(e)
    end

    def flat_map
      t_val = nil
      catch :type_error do
        begin
          t_val = yield value
          throw :type_error unless t_val.is_a?(Try)
          return t_val
        rescue StandardError => e
          return Error.new(e)
        end
      end
      raise TypeError, "Passed block should return `Try`, it returned `#{t_val.class}` instead"
    end

    def recover
      self
    end

    def to_maybe
      Some.new(value)
    end

    def ok?
      true
    end

    def error?
      false
    end

    def ==(other)
      other.class == Ok && other.value == value
    end

    alias_method :then, :flat_map
  end

  # Represents an error state object
  class Error < Try
    attr_reader :error

    def initialize(error)
      unless error.is_a?(Exception)
        raise ArgumentError, "`error` should be a sub-class of `Exception`"
      end

      @error = error
    end

    def value
      raise @error
    end

    def map
      self
    end

    def flat_map
      self
    end

    def recover
      yield @error
    end

    def to_maybe
      None.new
    end

    def ok?
      false
    end

    def error?
      true
    end

    def ==(other)
      other.class == Error && other.error == error
    end

    alias_method :then, :flat_map
  end
end
