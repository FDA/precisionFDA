class Workflow
  module IOObject
    class StageNameValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return if value == record.slot.name
        record.errors.add(attribute, :match, slot_name: record.slot.name, input_name: record.name,
                          stage_name: record.slot.slot_id, expected_name: record.slot.name)
      end
    end
  end
end
