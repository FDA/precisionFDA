module GraphDecorator
  class WorkflowNode < BaseNode

    def children
      return [] unless record.accessible_by?(context)

      record.apps.map do |app|
        build_child(app)
      end
    end

  end
end
