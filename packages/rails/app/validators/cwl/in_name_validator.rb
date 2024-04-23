module Cwl
  class InNameValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      values = record.app.spec["input_spec"].map { |input| input["name"] }
      return if value.in?(values)
      record.errors.add(attribute, :inclusion,
          step_name: record.step.name,
          app_name: record.app.title,
          inputs: values.join(', ')
      )
    end
  end
end
