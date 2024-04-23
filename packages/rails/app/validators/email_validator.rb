class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors.add(attribute, :format) unless User.validate_email(value)
    return if (!record.new_record? && !record.email_changed?) || record.errors.messages[:email].present?
    record.errors.add(attribute, :taken) if DNAnexusAPI.email_exists?(value)
  end
end
