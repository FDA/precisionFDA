class Workflow
  module Slot
    class AppPresenceValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return if value.present?
        record.errors.add(attribute, :blank, name: record.name)
      end
    end
  end
end
