class Workflow
  module Stages
    class InputPresenter
      include ActiveModel::Validations
      attr_reader :input, :input_number, :slot

      validates :name, 'workflow/i_o_object/name_non_empty': true,
                'workflow/i_o_object/name_format': true,
                'workflow/i_o_object/name_unique': true
      validates :input_class, 'workflow/i_o_object/field_non_empty': true,
                'workflow/i_o_object/class_inclusion': true
      validates :optional, 'workflow/i_o_object/boolean_inclusion': true
      validates :label, 'workflow/i_o_object/field_non_empty': { allow_empty: true }
      validates :required_run_input, 'workflow/i_o_object/boolean_inclusion': true
      validates :parent_slot, 'workflow/i_o_object/parent_slot': true
      validates :stage_name, 'workflow/i_o_object/stage_name': true
      validates :values, 'workflow/i_o_object/values_format': true,
                'workflow/i_o_object/values_linking': true

      def initialize(input, input_number, slot)
        @input = input
        @input_number = input_number
        @slot = slot
      end

      def name
        input["name"]
      end

      def input_class
        input["class"]
      end

      def optional
        input["optional"]
      end

      def label
        input["label"]
      end

      def required_run_input
        input["requiredRunInput"]
      end

      def parent_slot
        input["parent_slot"]
      end

      def stage_name
        input["stageName"]
      end

      def values
        input["values"]
      end

      def default_workflow_value
        input["default_workflow_value"]
      end

      def linked_to_a_stage?
        values["id"].try(:present?) && values["name"].try(:present?)
      end
    end
  end
end
