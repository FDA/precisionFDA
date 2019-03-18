class WdlObject
  class Task
    class IOObject
      include ActiveModel::Validations
      extend ActiveModel::Translation

      VALID_TYPES = %w(String Int Float File Boolean).freeze

      validates :object_type,
        presence: true,
        inclusion: {
          in: VALID_TYPES,
          message: "%{value} is not supported",
        }

      validates :name, presence: true

      attr_reader :raw

      def initialize(raw_io_object)
        @raw = raw_io_object
      end

      def name
        @name ||= raw[/^\s*\S+\s+(\S+)/, 1]
      end

      def object_type
        @object_type ||= raw[/^\s*(\S+)/]
      end

      def pfda_type
        object_type.downcase
      end
    end
  end
end
