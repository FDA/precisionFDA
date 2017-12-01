class AddScopedFolders < ActiveRecord::Migration
  def change
    change_table :nodes do |t|
      t.integer :scoped_parent_folder_id
    end
  end
end
