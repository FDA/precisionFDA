class Workflow
  module IOObject
    class NameUniqueValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return unless record.slot.inputs.map { |input| input["name"] }.count(value) > 1
        record.errors.add(attribute, :unique, slot_name: record.slot.name, input_name: record.name)
      end
    end
  end
end
