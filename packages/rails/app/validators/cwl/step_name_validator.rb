module Cwl
  class StepNameValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value.in?(App.accessible_by(record.context).pluck(:title))
      record.errors.add(attribute, :format, step_number: record.step_number)
    end
  end
end
