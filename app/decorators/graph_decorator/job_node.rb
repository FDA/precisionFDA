module GraphDecorator
  class JobNode < BaseNode

    def children
      return [] unless record.accessible_by?(context)

      children = record.input_files.map do |file|
        build_child(file)
      end

      children.push(build_child(record.app))
    end

  end
end
