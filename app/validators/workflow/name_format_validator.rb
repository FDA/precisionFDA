class Workflow
  class NameFormatValidator < ActiveModel::EachValidator
    def validate_each(record, attribute, value)
      return if value =~ /\A[a-zA-Z0-9._-]+\z/
      record.errors.add(attribute, :format)
    end
  end
end
