module CwlExporter::Adapter

  class Expression
    def initialize(value)
      @value = value
    end

    def encode_with(coder)
      coder.tag = nil
      coder.scalar = @value
      coder.style = Psych::Nodes::Scalar::SINGLE_QUOTED
    end
  end

  def output_eval(klass)
    case klass
    when "string"  then Expression.new "$(file_string())"
    when "int"     then Expression.new "$(parseInt(file_string()))"
    when "boolean" then Expression.new "$(file_string() == 'true')"
    when "float"   then Expression.new "$(parseFloat(file_string()))"
    else
      raise "Unsupported output type for output_binding: #{klass}"
    end
  end

  def cwl_type(klass)
    case klass
    when "string"  then "string"
    when "int"     then "long"
    when "file"    then "File"
    when "boolean" then "boolean"
    when "float"   then "double"
    else
      raise "Unsupported type: #{klass}"
    end
  end

end
