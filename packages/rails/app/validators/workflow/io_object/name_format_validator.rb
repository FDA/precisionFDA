class Workflow
  module IOObject
    class NameFormatValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return if value =~ /^[a-zA-Z_][0-9a-zA-Z_]*$/
        record.errors.add(attribute, :format, slot_name: record.slot.name, input_name: record.name)
      end
    end
  end
end
