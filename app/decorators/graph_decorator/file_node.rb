module GraphDecorator
  class FileNode < BaseNode

    def children
      return [] unless record.accessible_by?(context)
      return [build_child(record.parent)] if record.parent_type == "Node"
      return [build_child(record.parent)] if record.parent_type == "Job"
      return [build_child(record.parent)] if record.parent_type == "Comparison"
      []
    end

  end
end
