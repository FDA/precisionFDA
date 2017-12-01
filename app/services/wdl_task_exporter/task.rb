class WdlExporter::Task

  def initialize(app)
    @app = app
  end

  def to_s
  <<-TEXT
task #{app.name} {

#{inputs.join("\n")}

  command {
    #{command}
  }
  
  runtime {
    docker: "repository/name"
  }
  
  output {
#{outputs.join("\n")}
  } 
}
  TEXT
  end

  def inputs
    app.input_spec.map do |input|
      wdl_type = wdl_type(input["class"])
      name = input["name"]
      "  #{wdl_type} #{name}"
    end
  end

  def command
    params = app.input_spec.map do |input|
      "--#{input["name"]} ${#{input["name"]}}"
    end.join(" ")

    "/usr/bin/run #{params} && mv /data/out/* ."
  end

  def outputs
    app.output_spec.map do |output|
      wdl_type = wdl_type(output["class"])
      name = output["name"]
      wdl_expression = wdl_expression(output["class"], name)

      "    #{wdl_type} #{name} = #{wdl_expression}"
    end
  end

  private

  attr_reader :app

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
    when "file"    then "\"#{name}\""

    when "int"     then "read_int(\"#{name}\")"
    when "boolean" then "read_boolean(\"#{name}\")"
    when "float"   then "read_float(\"#{name}\")"
    else
      raise "Unsupported type: #{type}"
    end
  end

end
