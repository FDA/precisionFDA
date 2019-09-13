module Rats
  class Result
    attr_reader :value

    def ==(obj)
      obj.class == self.class && obj.value == value
    end
  end
end
