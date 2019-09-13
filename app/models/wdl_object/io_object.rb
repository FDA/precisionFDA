class WDLObject
  # Base wrapper class for a WDL input/output
  class IOObject
    include ActiveModel::Validations
    extend ActiveModel::Translation

    VALID_TYPES = %w(String Int Float File Boolean).freeze

    validates :name, presence: true

    validates :object_type,
              presence: true,
              inclusion: {
                in: VALID_TYPES,
                message: "%{value} is not supported",
              }

    validates :linked_io, presence: { message: "" }, if: -> { linked_task }
    validates :linked_task, presence: true, if: -> { linked_io }

    attr_reader :raw, :name, :object_type
    attr_accessor :linked_task

    def initialize(raw)
      @raw = raw
      @name = parse_name
      @object_type = parse_type[/\w+/]
    end

    def pfda_type
      object_type.downcase
    end

    def optional?
      parse_type.last == "?"
    end

    def required?
      !optional?
    end

    def values
      { id: linked_task.try(:slot_name), name: linked_io.try(:name) }
    end

    private

    def parse_name
      raw[/^\s*\S+\s+([a-zA-Z][a-zA-Z0-9_]+)/, 1]
    end

    def parse_type
      raw[/^\s*(\S+)/, 1]
    end
  end
end
