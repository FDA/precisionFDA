class WDLObject
  # Wrapper class for a WDL input
  class Input < IOObject
    attr_accessor :linked_output

    alias_method :linked_io, :linked_output
  end
end
