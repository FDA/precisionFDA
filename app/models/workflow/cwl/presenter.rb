class Workflow
  module Cwl
    class Presenter
      def initialize(cwl_string, context, steps_strings = nil)
        @cwl_string = cwl_string.strip
        cwl_hash = YAML.load(cwl_string)
        @cwl_data = cwl_hash.is_a?(Hash) ? cwl_hash : {}
        @steps = steps_strings
        @context = context
      end

      def build
        {
          slots: stages,
          workflow_name: workflow_name,
          readme: readme,
          workflow_title: workflow_title,
          is_new: true,
        }.with_indifferent_access
      end

      def workflow_name
        cwl_data["id"]
      end

      def workflow_title
        cwl_data["label"]
      end

      def readme
        cwl_data["doc"] || ""
      end

      def inputs
        @inputs ||= cwl_data["inputs"]
      end

      def outputs
        @outputs ||= IOObject.build(cwl_data["outputs"])
      end

      def stages
        @stages ||= stages_object.build
      end

      def stages_object
        @stages_object ||= Workflow::Cwl::StagesPresenter.new(
          cwl_data["steps"], context, steps_strings
        )
      end

      private

      attr_reader :cwl_string, :cwl_data, :steps_strings, :context
    end
  end
end
