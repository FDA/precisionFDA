class WDLObject
  class Workflow
    # Wrapper class for a call's inputs mapping
    class InputMapping
      include ActiveModel::Validations

      validates :input_name, :expression, presence: { message: "is not found!" }

      attr_reader :raw, :input_name, :expression, :link
      alias_method :to_s, :raw

      def initialize(raw)
        @raw = raw
        @input_name, @expression =
          raw.match(/([a-zA-Z][a-zA-Z0-9_]+)\s*\=\s*([a-zA-Z][a-zA-Z0-9_\.]+)/).try(:captures)
        @link = parse_links
      end

      private

      def parse_links
        linked_task, linked_output =
          expression.match(/^([a-zA-Z][a-zA-Z0-9_]+)\.([a-zA-Z][a-zA-Z0-9_]+)$/).try(:captures)

        return if linked_task.nil? || linked_output.nil?

        {
          linked_task: linked_task,
          linked_output: linked_output,
        }
      end
    end
  end
end
