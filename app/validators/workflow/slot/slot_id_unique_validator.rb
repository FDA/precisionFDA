class Workflow
  module Slot
    class SlotIdUniqueValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        if record.slot_objects.map(&:slot_id).count(value) > 1
          record.errors.add(attribute, :unique, name: record.name)
        end
      end
    end
  end
end
