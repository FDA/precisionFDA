class CwlExporter::Step
  include ::CwlExporter::Adapter

  def initialize(app)
    @app = app
  end

  def to_s
    cwl_hash =
      {
        "class" => "CommandLineTool",
        "id" => app.dxid,
        "label" => app.title,
        "cwlVersion" => "v1.0",
        "baseCommand" => base_command,
        "requirements" => [
          {
            "class" => "DockerRequirement",
            "dockerPull" => app.name,
            "dockerOutputDirectory" => "/data/out"
          },
          {
            "class" => "InlineJavascriptRequirement",
            "expressionLib" => [
              'function file_string() ' \
              '{ return self[0].contents.replace(/(\r\n|\n|\r)/gm,"") }'
            ]
          }
        ],
        "inputs" => inputs,
        "outputs" => outputs
      }

    cwl_hash["doc"] = app.readme if app.readme.present?

    cwl_hash.to_yaml
  end

  private

  attr_reader :app

  def base_command
    parsed = app.code[/baseCommand:\s+(.+)/, 1] || ""

    YAML.load(parsed) || []
  end

  def inputs
    position = 1

    app.input_spec.each_with_object({}) do |app_input, result|
      cwl_input = {
        "inputBinding" => {
          "position" => position,
          "prefix" => "--" + app_input["name"]
        },
        "type" => cwl_type(app_input["class"])
      }

      if app_input.key?("default") && app_input["class"] != "file"
        cwl_input["default"] = app_input["default"]
      end

      cwl_input["type"] += "?" if app_input["optional"]
      cwl_input["doc"] = app_input["help"] if app_input["help"].present?
      cwl_input["label"] = app_input["label"] if app_input["label"].present?

      result[app_input["name"]] = cwl_input
      position += 1
    end
  end

  def outputs
    app.output_spec.each_with_object({}) do |app_output, result|
      cwl_output = { "type" => cwl_type(app_output["class"]) }

      cwl_output["doc"] = app_output["help"] if app_output["help"].present?
      cwl_output["label"] = app_output["label"] if app_output["label"].present?
      cwl_output["type"] += "?" if app_output["optional"]

      cwl_output["outputBinding"] =
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

      result[app_output["name"]] = cwl_output
    end
  end
end
