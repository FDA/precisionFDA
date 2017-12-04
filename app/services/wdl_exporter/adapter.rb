module WdlExporter::Adapter

  def wdl_type(klass)
    case klass
    when "string"  then "String"
    when "file"    then "File"

    when "int"     then "Int"
    when "boolean" then "Boolean"
    when "float"   then "Float"
    else
      raise "Unsupported type: #{type}"
    end
  end

  def wdl_expression(klass, name)
    case klass
    when "string"  then "read_string(\"#{name}\")"
    when "file"    then "select_first(glob(\"#{name}/*\"))"

    when "int"     then "read_int(\"#{name}\")"
    when "boolean" then "read_boolean(\"#{name}\")"
    when "float"   then "read_float(\"#{name}\")"
    else
      raise "Unsupported type: #{type}"
    end
  end

end
