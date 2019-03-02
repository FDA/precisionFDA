class CopyService
  class Copies
    Copy = Struct.new(:object, :source, :copied)

    def self.wrap(object)
      if object.is_a?(Copies)
        object
      else
        copies = Copies.new
        copies.push(object: object, source: nil)
        copies
      end
    end

    def initialize
      @copies = []
    end

    def push(object:, source:, copied: true)
      copies << Copy.new(object, source, copied)
    end

    def each
      copies.each do |copy|
        yield copy.object, copy.source, copy.copied
      end
    end

    def find
      copies.find do |copy|
        yield copy.object, copy.source, copy.copied
      end
    end

    def all
      copies.map(&:object)
    end

    def first
      copies.first.object
    end

    private

    attr_reader :copies
  end
end
