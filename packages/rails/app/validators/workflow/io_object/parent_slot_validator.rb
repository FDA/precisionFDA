class Workflow
  module IOObject
    class ParentSlotValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return if value == record.slot.slot_id
        record.errors.add(attribute, :match, slot_name: record.slot.name, input_name: record.name,
                          parent_slot: value, slot_id: record.slot.slot_id)
      end
    end
  end
end
