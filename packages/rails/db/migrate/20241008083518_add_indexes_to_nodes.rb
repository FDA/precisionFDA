class AddIndexesToNodes < ActiveRecord::Migration[6.1]
  def up
    add_index :nodes, :parent_folder_id
    add_index :nodes, :scoped_parent_folder_id
  end

  def down
    remove_index :nodes, :parent_folder_id
    remove_index :nodes, :scoped_parent_folder_id
  end
end
