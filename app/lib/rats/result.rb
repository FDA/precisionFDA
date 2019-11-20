module Rats
  # Represents a result
  class Result
    attr_reader :value

    def ==(other)
      other.class == self.class && other.value == value
    end
  end
end
