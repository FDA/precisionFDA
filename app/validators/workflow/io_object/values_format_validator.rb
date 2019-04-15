class Workflow
  module IOObject
    class ValuesFormatValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return if value.is_a?(Hash) && value.key?("id") && value.key?("name")
        record.errors.add(attribute, :format, slot_name: record.slot.name, input_name: record.name)
      end
    end
  end
end
