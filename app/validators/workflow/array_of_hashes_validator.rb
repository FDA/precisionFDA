class Workflow
  class ArrayOfHashesValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value.is_a?(Array) && value.all? { |item| item.is_a?(Hash) }
      record.errors.add(attribute, :array_of_hashes, attribute: attribute)
    end
  end
end
