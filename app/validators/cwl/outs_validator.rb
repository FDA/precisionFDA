module Cwl
  class OutsValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value.is_a?(Array) && value.all? { |item| item.is_a?(String) }
      record.errors.add(attribute, :format)
    end
  end
end
