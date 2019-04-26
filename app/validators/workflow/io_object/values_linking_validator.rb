class Workflow
  module IOObject
    class ValuesLinkingValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        if record.slot.slot_number == 0 && !record.optional && !record.required_run_input && record.default_workflow_value.nil?
          record.errors.add(attribute, :compatible_linking, message_options(record))
        elsif !record.optional && !record.required_run_input && !record.linked_to_a_stage? && record.default_workflow_value.nil?
          record.errors.add(attribute, :stage_output_linking, message_options(record))
        elsif record.linked_to_a_stage?
          linked_to_stage_validations(value, attribute, record)
        end
      end

      def linked_to_stage_validations(value, attribute, record)
        return if record.slot.stage_index
        slot_id_mismatch = record.slot.previous_slot_object.slot_id != value["id"]
        linked_to_previous_stage = record.slot.linked_to_previous_stage?(value["name"])
        if !record.required_run_input && (slot_id_mismatch || !linked_to_previous_stage)
          record.errors.add(attribute, :wrong_output_stage_linking, message_options(record))
        elsif record.input_class != output_class(record, value)
          options = message_options(record).merge(input_class: record.input_class,
                                                  output_class: output_class(record, value))
          record.errors.add(attribute, :wrong_output_class_linking, options)
        end
      end

      def message_options(record)
        { slot_name: record.slot.name, input_name: record.name }
      end

      def output_class(record, value)
        record.slot.output_classes[record.slot.previous_slot_object.slot_id][value["name"]]
      end
    end
  end
end
