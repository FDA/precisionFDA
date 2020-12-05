# $call = 'call' $ws* $namespaced_identifier $ws+ ('as' $identifier)? $ws* $call_body?
# $call_body = '{' $ws* $inputs? $ws* '}'
# $inputs = 'input' $ws* ':' $ws* $variable_mappings
# $variable_mappings = $variable_mapping_kv (',' $variable_mapping_kv)*
# $variable_mapping_kv = $identifier $ws* '=' $ws* $expression

class WDLObject
  class Workflow
    # Wrapper class for a WDL call statement
    class Call
      include ActiveModel::Validations
      include WDLObject::Parseable

      validates :name, presence: { message: "is not found!" }
      validate :input_mappings_should_be_valid

      attr_reader :raw, :name, :input_mappings
      alias_method :to_s, :raw

      def initialize(raw)
        @raw = raw
        @name = parse_section_identifier(raw, section_name)
        @input_mappings = parse_mappings
      end

      private

      def section_name
        "call"
      end

      def parse_mappings
        parsed =
          raw[/
            \s*#{section_name}\s*\w+\s*{
            \s*input:\s*
            (([a-zA-Z][a-zA-Z0-9_]+
            \s*\=\s*
            [a-zA-Z][a-zA-Z0-9_\.]+\s*
            ,?\s*)+?)\s+}\s+
          /xm, 1]

        return [] unless parsed

        parsed.split(/\s*,\s*/).map do |mapping|
          WDLObject::Workflow::InputMapping.new(mapping.strip)
        end
      end

      def input_mappings_should_be_valid
        input_mappings.each do |mapping|
          next if mapping.valid?

          mapping.errors.full_messages.each do |msg|
            errors.add("base", "input mapping #{msg}")
          end
        end
      end
    end
  end
end
