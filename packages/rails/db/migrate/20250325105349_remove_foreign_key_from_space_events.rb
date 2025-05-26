class RemoveForeignKeyFromSpaceEvents < ActiveRecord::Migration[6.1]
  def up
    remove_foreign_key :space_events, :spaces
  end

  def down
    add_foreign_key :space_events, :spaces
  end
end
