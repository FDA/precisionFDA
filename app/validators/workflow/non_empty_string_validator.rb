class Workflow
  class NonEmptyStringValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if (options[:allow_empty] || value.present?) && value.is_a?(String)
      record.errors.add(attribute, :non_empty_string, message_options(attribute, record))
    end

    private

    def message_options(attribute, record)
      { name: record.name, attribute: attribute }
    end
  end
end
