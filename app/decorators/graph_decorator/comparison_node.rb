module GraphDecorator
  class ComparisonNode < BaseNode

    def children
      return [] unless record.accessible_by?(context)

      record.user_files.map do |file|
        build_child(file)
      end
    end

  end
end
