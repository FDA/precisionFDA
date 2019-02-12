class CwlPresenter
  class IOObject
    class << self
      def build(io_data)
        io_data.map do |data|
          parsed_type = parse_type(data.second['type'])
          default = data.second['default'] if parsed_type != "File"

          new(
            name: data.first,
            label: data.second['label'],
            type: parsed_type,
            doc: data.second['doc'],
            optional: parse_optional(data.second['type']),
            default: default
          )
        end
      rescue
        []
      end

      private

      def parse_optional(type)
        case type
        when Array
          type.include?('null')
        when String
          type.ends_with? '?'
        else
          false
        end
      end

      def parse_type(type)
        case type
        when Array
          (type - ['null']).first
        when String
          type.chomp('?')
        end
      end
    end

    attr_reader :name, :type, :label, :doc, :optional, :default

    def initialize(name:, label:, type:, doc:, optional: false, default: nil)
      @name = name
      @label = label
      @type = type
      @doc = doc
      @optional = optional
      @default = default
    end

    def pfda_type
      case type
      when "string"  then "string"
      when "int"     then "int"
      when "long"    then "int"
      when "File"    then "file"
      when "boolean" then "boolean"
      when "float"   then "float"
      when "double"  then "float"
      end
    end
  end
end
