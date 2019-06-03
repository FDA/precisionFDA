class Workflow
  class BooleanInclusionValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value.in?([false, true])
      record.errors.add(attribute, :inclusion, message_options(attribute, record))
    end

    private

    def message_options(_attribute, _record)
      {}
    end
  end
end
