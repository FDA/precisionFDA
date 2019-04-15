class Workflow
  module Slot
    class InstanceTypeInclusionValidator < ActiveModel::EachValidator
      def validate_each(record, attribute, value)
        return if value.in?(Job::INSTANCE_TYPES.keys)
        record.errors.add(attribute, :inclusion, name: record.name)
      end
    end
  end
end
