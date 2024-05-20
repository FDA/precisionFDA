module Cwl
  class StepsValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value.values.all? { |step_json| step_json.is_a?(Hash) }
      record.errors.add(attribute, :format)
    end
  end
end
