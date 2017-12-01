module Rats
  class Try
  end

  class Ok < Try
    attr_accessor :value

    def initialize(value)
      @value = value
    end

    def map(&block)
      begin
        Ok.new(yield value)
      rescue => e
        Error.new(e)
      end
    end

    def flat_map(&block)
      t_val = nil
      catch :type_error do
        begin
          t_val = yield value
          throw :type_error unless t_val.is_a?(Try)
          return t_val
        rescue => e
          return Error.new(e)
        end
      end
      raise TypeError, "Passed block should return `Try`, it returned `#{t_val.class}` instead"
    end

    def recover(&block)
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

    def ==(obj)
      obj.class == Ok && obj.value == value
    end

    alias_method :then, :flat_map
  end

  class Error < Try
    attr_reader :error

    def initialize(error)
      raise ArgumentError, "`error` should be a sub-class of `Exception`" unless error.is_a?(Exception)
      @error = error
    end

    def value
      raise @error
    end

    def map(&block)
      self
    end

    def flat_map(&block)
      self
    end

    def recover(&block)
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

    def ==(obj)
      obj.class == Error && obj.error == error
    end

    alias_method :then, :flat_map
  end
end
