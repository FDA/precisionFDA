class Workflow
  module Slot
    class NameNonEmptyValidator < NonEmptyStringValidator
      private

      def message_options(_attribute, record)
        { number: (record.slot_number + 1).ordinalize }
      end
    end
  end
end
