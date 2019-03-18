class WdlObject
  class Task
    class Output < IOObject
      validates :value, presence: true

      def value
        @value ||= raw[/^\s*\S+\s+\S+\s*=\s+(.+)$/, 1]
      end
    end
  end
end
