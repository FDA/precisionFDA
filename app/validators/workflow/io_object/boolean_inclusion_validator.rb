class Workflow
  module IOObject
    class BooleanInclusionValidator < Workflow::BooleanInclusionValidator
      private

      def message_options(_attribute, record)
        { slot_name: record.slot.name, input_name: record.name }
      end
    end
  end
end
