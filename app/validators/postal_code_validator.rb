class PostalCodeValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return unless checking_condition(record)
    return if User.validate_state(record.us_state, record.postal_code)
    record.errors.add(:postal_code, :match, match_object: record.us_state)
  rescue => e
    Rails.logger.error(e.message)
    record.errors.add(:postal_code, :match, match_object: record.us_state)
  end

  def checking_condition(record)
    (record.postal_code_changed? || record.us_state_changed?) && record.country.try(:usa?)
  end
end
