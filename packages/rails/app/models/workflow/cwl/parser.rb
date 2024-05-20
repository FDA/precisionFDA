class Workflow
  module Cwl
    class Parser
      include ActiveModel::Validations
      attr_reader :cwl_data, :context

      validates :cwl_class, 'cwl/class': true
      validates :name, 'workflow/non_empty_string':true, 'workflow/name_format': true
      validates :title, 'workflow/non_empty_string': true
      validates :readme, 'workflow/non_empty_string': { allow_empty: true }
      validates :inputs, :outputs, presence: true
      validates :steps, 'cwl/steps': true
      validate :docker_image_valid?, if: :requirements
      validate :steps_valid?

      def initialize(cwl_string, context)
        @cwl_string = cwl_string.strip
        cwl_hash = YAML.load(cwl_string)
        @cwl_data = cwl_hash.is_a?(Hash) ? cwl_hash : {}
        @context = context
      end

      def cwl_class
        cwl_data["class"]
      end

      def name
        @name ||= cwl_data["id"]
      end

      def title
        @title ||= cwl_data["label"]
      end

      def readme
        @readme ||= cwl_data["doc"] || ""
      end

      def inputs
        @inputs ||= cwl_data["inputs"]
      end

      def outputs
        @inputs ||= cwl_data["outputs"]
      end

      def steps
        @steps ||= cwl_data["steps"]
      end

      def requirements
        @requirements = cwl_data["requirements"]
      end

      def docker_image
        return unless requirements
        @docker_image ||= DockerImage.new(requirements["DockerRequirement"]["dockerPull"])
      end

      def steps_objects
        @steps_objects ||= steps.map.with_index do |(title, step), index|
          StepParser.new(title, step, index, self)
        end
      end

      def find_step(step_number)
        steps_objects.select { |step| step.step_number == step_number }.first
      end

      def docker_image_valid?
        return if errors.any? || docker_image.valid?
        docker_image.errors.full_messages.each do |value|
          errors.add(:base, value)
        end
      end

      def steps_valid?
        return if errors.any? || steps_objects.all? { |step| step.valid? }

        steps_objects.each do |step|
          step.errors.messages.values.flatten.each do |value|
            errors.add(:base, "Step #{step.name}: #{value}")
          end
        end
      end
    end
  end
end
