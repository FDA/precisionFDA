class WdlExporter::Task

  include ::WdlExporter::Adapter

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

  private

  attr_reader :app

  def inputs
    app.input_spec.map do |input|
      wdl_type = wdl_type(input["class"])
      name = input["name"]
      "  #{wdl_type} #{name}"
    end
  end

  def command
    params = app.input_spec.map do |input|
      "--#{input["name"]} \"${#{input["name"]}}\""
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

end
