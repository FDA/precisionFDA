module Cwl
  class InLinkValidator < BaseLinkValidator
    def validate_each(record, attribute, value)
      allowable_values = record.allowable_link_outputs + record.parser.inputs.keys
      if !value.in?(allowable_values)
        record.errors.add(attribute, :inclusion,
                          step_name: record.step.name,
                          input_name: record.name,
                          link: value,
                          inputs: allowable_values.join(', ')
        )
      elsif can_validate_link_type?(record)
        validate_link_type(record, attribute)
      end
    end
  end
end
