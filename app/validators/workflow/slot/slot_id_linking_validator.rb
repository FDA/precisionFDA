class Workflow
  module Slot
    class SlotIdLinkingValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        if record.stage_index
          if record.next_slot && !record.next_slot_linked?
            record.errors.add(attribute, :next_slot_not_linked, name: record.name)
          end
          if record.prev_slot && !record.prev_slot_linked?
            record.errors.add(attribute, :prev_slot_not_linked, name: record.name)
          end
        else
          return if record.slot_number == 0
          prev_slot_object = record.previous_slot_object
          if prev_slot_object.next_slot_expected? && prev_slot_object.next_slot != value
            record.errors.add(attribute, :link_next_slot, name: record.name)
          elsif record.prev_slot_expected? && record.prev_slot != prev_slot_object.slot_id
            record.errors.add(attribute, :link_prev_slot, name: record.name)
          end
        end
      end
    end
  end
end
