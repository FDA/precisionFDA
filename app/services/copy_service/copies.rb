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

    def concat(other)
      copies.concat(other.copies)
    end

    def first
      copies.first.object
    end

    def method_missing(method, *args, &block)
      copies.respond_to?(method) ? copies.send(method, *args, &block) : super
    end

    def respond_to_missing?(method, include_private = false)
      copies.respond_to?(method) || super
    end

    attr_reader :copies
  end
end
