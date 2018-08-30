class CopyService
  class NoteCopier

    def initialize(api:, user:)
      @api = api
      @user = user
    end

    def copy(note, scope)
      new_note = note.dup
      new_note.scope = scope
      new_note.save!

      copy_dependencies(new_note, note, scope)
      new_note
    end

    private

    attr_reader :api, :user

    def copy_dependencies(new_note, note, scope)
      note.attachments.find_each do |attachment|
        new_items = Array.wrap(copy_service.copy(attachment.item, scope))
        new_items.each do |new_item|
          new_note.attachments.create(item: new_item)
        end
      end
    end

    def copy_service
      @copy_service ||= CopyService.new(user: user, api: api)
    end

  end
end
