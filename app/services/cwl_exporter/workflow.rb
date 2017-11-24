class CwlExporter
  class Workflow

    include ::CwlExporter::Adapter

    delegate :stages, to: :workflow

    def initialize(workflow)
      @workflow = workflow
    end

    def to_s
      {
        "cwlVersion" => "v1.0",
        "class" => "Workflow",
        "inputs" => inputs,
        "steps" => steps,
        "outputs" => outputs
      }.to_yaml
    end

    private

    attr_reader :workflow

    def inputs
      workflow.unused_input_spec.each_with_object({}) do |input, result|
        result[input[:name]] = cwl_type(input[:class])
      end
    end

    def steps
      stages.each_with_object({}) do |stage, result|
        result[stage["name"]] = {
          "run" => "#{stage["name"]}.cwl",
          "in" => step_in(stage),
          "out" => step_out(stage)
        }
      end
    end

    def outputs
      workflow.unused_output_spec.each_with_object({}) do |output, result|
        result[output[:name]] = {
          "type" => cwl_type(output[:class]),
          "outputSource" => "#{output[:stageName]}/#{output[:name]}"
        }
      end
    end

    def step_in(stage)
      stage["inputs"].each_with_object({}) do |input, result|
        result[input["name"]] = value_source(input)
      end
    end

    def step_out(step)
      step["outputs"].map { |output| output["name"] }
    end

    def value_source(input)
      return input["name"] if input["values"]["id"].blank?

      source_stage = stages.detect { |stage| stage["slotId"] == input["values"]["id"] }

      "#{source_stage["name"]}/#{input["values"]["name"]}"
    end

  end
end
