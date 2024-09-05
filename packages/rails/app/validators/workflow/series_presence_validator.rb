class Workflow
  class SeriesPresenceValidator < ActiveModel::EachValidator
    def validate_each(record, _attribute, value)
      if !record.is_new && value.blank?
        record.errors.add(:workflow_series, :blank, name: record.name)
      elsif record.is_new && value.present?
        record.errors.add(:workflow_series, :unique, name: record.name)
      end
    end
  end
end
