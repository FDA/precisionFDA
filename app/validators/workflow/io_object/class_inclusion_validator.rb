class Workflow
  module IOObject
    class ClassInclusionValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return if value.in?(App::VALID_IO_CLASSES)
        record.errors.add(attribute, :inclusion, slot_name: record.slot.name,
                                                 input_name: record.name,
                                                 types: App::VALID_IO_CLASSES.join(", "))
      end
    end
  end
end
