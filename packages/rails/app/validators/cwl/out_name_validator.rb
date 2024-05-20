module Cwl
  class OutNameValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      values = record.app.spec["output_spec"].map { |output| output["name"] }
      return if value.in?(values)
      record.errors.add(attribute, :inclusion,
                        step_name: record.step.name,
                        app_name: record.app.title,
                        outputs: values.join(', ')
      )
    end
  end
end
