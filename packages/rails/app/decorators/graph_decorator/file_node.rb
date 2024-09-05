module GraphDecorator
  class FileNode < BaseNode
    def children
      if %w(Node Job Comparison).include?(record.parent_type) && record.accessible_by?(context) && !record.parent.nil?
        return [build_child(record.parent)]
      end

      []
    end
  end
end