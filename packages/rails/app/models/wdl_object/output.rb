class WDLObject
  # Wrapper class for a WDL output
  class Output < IOObject
    validates :value, presence: true

    attr_accessor :linked_input
    alias_method :linked_io, :linked_input

    def value
      @value ||= raw[/^\s*\S+\s+[a-zA-Z][a-zA-Z0-9_]+\s*=\s*(.+)$/, 1]
    end
  end
end
