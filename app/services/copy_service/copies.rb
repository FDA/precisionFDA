class CopyService
  class Copies

    Copy = Struct.new(:file, :source, :copied)

    def initialize
      @copies = []
    end

    def push(file:, source:, copied: true)
      copies << Copy.new(file, source, copied)
    end

    def each
      copies.each do |copy|
        yield copy.file, copy.source, copy.copied
      end
    end

    def find
      copies.find do |copy|
        yield copy.file, copy.source, copy.copied
      end
    end

    def all
      copies.map(&:file)
    end

    def first
      copies.first.file
    end

    private

    attr_reader :copies

  end
end
