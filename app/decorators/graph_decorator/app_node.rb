module GraphDecorator
  class AppNode < BaseNode

    def children
      return [] unless record.accessible_by?(context)

      record.assets.map do |asset|
        build_child(asset)
      end
    end

  end
end
