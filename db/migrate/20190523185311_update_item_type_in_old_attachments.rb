class UpdateItemTypeInOldAttachments < ActiveRecord::Migration
  def change
    reversible do |dir|
      dir.up do
        Attachment.where(item_type: "UserFile").update_all(item_type: "Node")
      end
    end
  end
end
