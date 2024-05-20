class Workflow
  module IOObject
    class NameNonEmptyValidator < NonEmptyStringValidator
      private

      def message_options(_attribute, record)
        { slot_name: record.slot.name, input_number: (record.input_number + 1).ordinalize }
      end
    end
  end
end
