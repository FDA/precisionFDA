module Cwl
  class InLinkFirstStepValidator < BaseLinkValidator
    def validate_each(record, attribute, value)
      workflow_inputs = record.parser.inputs.keys
      if !value.in?(workflow_inputs)
        record.errors.add(attribute, :first_step_inclusion,
                          step_name: record.step.name,
                          input_name: record.name,
                          link: value,
                          inputs: workflow_inputs.join(', ')
        )
      elsif can_validate_link_type?(record)
        validate_link_type(record, attribute)
      end
    end
  end
end
