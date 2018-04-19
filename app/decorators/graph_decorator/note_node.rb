module GraphDecorator
  class NoteNode < BaseNode

    def children
      return [] unless record.accessible_by?(context)

      record.attachments.map do |attachment|
        build_child(attachment.item)
      end
    end

  end
end
