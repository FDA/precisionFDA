class CwlExporter::Step

  include ::CwlExporter::Adapter

  def initialize(app)
    @app = app
  end

  def to_s
    {
      "class" => "CommandLineTool",
      "id" => app.dxid,
      "label" => app.title,
      "cwlVersion" => "v1.0",
      "baseCommand" => [],
      "requirements" => [
        {
          "class" => "DockerRequirement",
          "dockerPull" => app.name,
          "dockerOutputDirectory" => "/data/out"
        },
        {
          "class" => "InlineJavascriptRequirement",
          "expressionLib" => ['function file_string() { return self[0].contents.replace(/(\r\n|\n|\r)/gm,"") }']
        }
      ],
      "inputs" => inputs(app),
      "outputs" => outputs(app)
    }.to_yaml
  end

  private

  attr_reader :app

  def inputs(app)
    position = 1

    app.input_spec.each_with_object({}) do |app_input, result|
      cwl_inp = {
        "doc" => app_input["help"],
        "inputBinding" => {
          "position" => position,
          "prefix" => "--" + app_input["name"]
        },
        "type" => cwl_type(app_input["class"])
      }

      if app_input.key?("default") && app_input["class"] != "file"
        cwl_inp["default"] = app_input["default"]
      end

      if app_input["optional"]
        cwl_inp["type"] = cwl_inp["type"] + "?"
      end

      result[app_input["name"]] = cwl_inp
      position = position + 1
    end
  end

  def outputs(app)
    app.output_spec.each_with_object({}) do |app_output, result|

      cwl_outp = {
        "doc" => app_output["help"],
        "type" => cwl_type(app_output["class"])
      }

      cwl_outp["outputBinding"] =
        if app_output["class"] == "file"
          {
            "glob" => "#{app_output["name"]}/*"
          }
        else
          {
            "glob" => app_output["name"],
            "loadContents" => true,
            "outputEval" => output_eval(app_output["class"])
          }
        end

      result[app_output["name"]] = cwl_outp
    end
  end

end
