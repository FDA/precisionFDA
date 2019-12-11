class WDLObject
  module Validatable
    # Contains validations for WDL inputs and outputs
    module InputsOutputs
      def inputs_should_be_valid
        inputs.each do |input|
          next if input.valid?

          input.errors.full_messages.each do |msg|
            errors.add("base", "input #{msg}")
          end
        end
      end

      def outputs_should_be_valid
        outputs.each do |output|
          next if output.valid?

          output.errors.full_messages.each do |msg|
            errors.add("base", "output #{msg}")
          end
        end
      end

      def inputs_should_be_unique
        items_should_be_unique(inputs.map(&:name), "input")
      end

      def outputs_should_be_unique
        items_should_be_unique(outputs.map(&:name), "output")
      end

      def items_should_be_unique(items, item_type)
        find_duplicates(items).each do |duplicate|
          errors.add("base", "#{item_type} '#{duplicate}' is duplicated")
        end
      end

      def find_duplicates(items)
        items.select { |item| items.count(item) > 1 }.uniq
      end
    end
  end
end
