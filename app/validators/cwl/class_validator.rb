module Cwl
  class ClassValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value == 'Workflow'
      record.errors.add(attribute, :format)
    end
  end
end
