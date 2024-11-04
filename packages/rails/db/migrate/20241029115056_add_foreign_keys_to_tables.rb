class AddForeignKeysToTables < ActiveRecord::Migration[6.1]
  def up
    add_foreign_key :challenges, :spaces, column: :space_id
    add_foreign_key :space_memberships_spaces, :spaces, column: :space_id
    add_foreign_key :spaces, :spaces, column: :space_id
  end

  def down
    remove_foreign_key :challenges, column: :space_id
    remove_foreign_key :space_memberships_spaces, column: :space_id
    remove_foreign_key :spaces, column: :space_id
  end
end
