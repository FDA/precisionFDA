class WdlExporter
  class Workflow

    include ::WdlExporter::Adapter

    delegate :stages, to: :workflow

    def initialize(workflow)
      @workflow = workflow
    end

    def name
      workflow.name.underscore
    end

    def to_s
    <<-TEXT
#{import.join("\n")}

workflow #{name} {

#{inputs.join("\n")}

#{calls.join("\n")}

  output {
#{outputs.join("\n")}
  } 
}
    TEXT
    end

    private

    attr_reader :workflow

    def import
      workflow.apps.map do |app|
        "import \"#{app.name}.wdl\" as #{app.name}"
      end
    end

    def inputs
      workflow.unused_input_spec.map do |input|
        "  #{wdl_type(input[:class])} #{input[:name]}"
      end
    end

    def calls
      stages.map do |stage|
        "  call #{stage["name"]}.#{stage["name"]} {\n"\
        "    input: #{call_inputs(stage).join(', ')}\n"\
        "  }"
      end
    end

    def outputs
      workflow.unused_output_spec.map do |output|
        "    #{wdl_type(output[:class])} #{output[:name]} = #{output[:stageName]}.#{output[:name]}"
      end
    end

    def call_inputs(stage)
      stage["inputs"].map do |input|
        "#{input["name"]}=#{value_source(input)}"
      end
    end

    def value_source(input)
      return input["name"] if input["values"]["id"].blank?

      source_stage = stages.detect { |stage| stage["slotId"] == input["values"]["id"] }

      "#{source_stage["name"]}.#{input["values"]["name"]}"
    end

  end
end
