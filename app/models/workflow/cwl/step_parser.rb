class Workflow
  module Cwl
    class StepParser
      include ActiveModel::Validations

      attr_reader :step_json, :title, :parser, :step_number
      delegate :context, to: :parser

      validates :id, :inputs, :outputs, :run, presence: true
      validates :run, 'cwl/step_run': true
      validates :app, 'workflow/slot/app_presence': true
      validates :name, 'cwl/step_name': true
      validates :outputs, 'cwl/outs': true
      validate :inputs_valid?
      validate :outputs_valid?
      validate :docker_image_valid?, if: 'requirements'

      def initialize(title, step_json, step_number, parser)
        @title = title
        @step_json = step_json
        @step_number = step_number
        @parser = parser
      end

      def name
        title
      end

      def id
        step_json["id"]
      end

      def app
        @app ||= App.accessible_by(context).find_by_uid(id)
      end

      def run
        step_json["run"]
      end

      def inputs
        step_json["in"]
      end

      def outputs
        step_json["out"]
      end

      def requirements
        step_json["requirements"]
      end

      def docker_image
        return unless requirements
        @docker_image ||= DockerImage.new(requirements["DockerRequirement"]["dockerPull"])
      end

      def input_objects
        @input_objects ||= inputs.map { |input, link|  InputParser.new(input, link, self) }
      end

      def output_objects
        @output_objects ||= outputs.map { |input| OutputParser.new(input, self) }
      end

      def prev_step
        parser.find_step(step_number - 1)
      end

      def allowable_link_outputs
        prev_step.outputs.map do |output|
          [prev_step.name, output].join('/')
        end
      end

      def docker_image_valid?
        return if errors.any? || docker_image.valid?
        docker_image.errors.full_messages.each do |value|
            errors.add(:base, value)
        end
      end

      def inputs_valid?
        return if errors.any? || input_objects.all? { |input| input.valid? }

        input_objects.each do |input|
          input.errors.messages.values.flatten.each do |value|
            errors.add(:base, value)
          end
        end
      end

      def outputs_valid?
        return if errors.any? || output_objects.all? { |output| output.valid? }

        output_objects.each do |output|
          output.errors.messages.values.flatten.each do |value|
            errors.add(:base, value)
          end
        end
      end
    end
  end
end
