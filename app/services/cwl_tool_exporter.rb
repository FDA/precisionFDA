class CwlToolExporter

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

  def export(app, dockerfile, name)
    TarballBuilder.build do |tar|
      add_file(tar, "README.md", readme(name))
      add_file(tar, "#{name}.cwl", pfda_app_to_cwl(app, name).to_yaml)
      add_file(tar, "Dockerfile", dockerfile)
    end
  end

  def add_file(tar, filename, content, mode = 777)
    tar.add_file filename, mode do |tf|
      tf.write content
    end
  end

  def readme(name)
    <<-EOH
##{name}

To execute this app locally, please ensure you have Docker (get.docker.com) and cwltool ('pip install cwtool') and run:

```
docker build . -t #{name}
sudo cwltool --no-match-user --no-read-only #{name}.cwl inputs.json
```

where inputs.json is a standard CWL input file definition (see 'A Gentle Guide to CWL' for examples).
    EOH
  end

  def pfda_app_to_cwl(app, docker_pull)
    {
      "class" => "CommandLineTool",
      "id" => app.dxid,
      "label" => app.title,
      "cwlVersion" => "v1.0",
      "baseCommand" => [],
      "requirements" => [
        {
          "class" => "DockerRequirement",
          "dockerPull" => docker_pull,
          "dockerOutputDirectory" => "/data/out"
        },
        {
          "class" => "InlineJavascriptRequirement",
          "expressionLib" => ['function file_string() { return self[0].contents.replace(/(\r\n|\n|\r)/gm,"") }']
        }
      ],
      "inputs" => inputs(app),
      "outputs" => outputs(app)
    }
  end

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

  def cwl_type(type)
    case type
    when "string"  then "string"
    when "int"     then "long"
    when "file"    then "File"
    when "boolean" then "boolean"
    when "float"   then "double"
    else
      raise "Unsupported type: #{type}"
    end
  end

end
