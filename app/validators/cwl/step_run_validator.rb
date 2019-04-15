module Cwl
  class StepRunValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value == "#{record.name}.cwl"
      record.errors.add(attribute, :format, name: record.name)
    end
  end
end
