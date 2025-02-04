class AddHiddenColumnToSpaces < ActiveRecord::Migration[6.1]
  def up
    add_column :spaces, :hidden, :boolean, default: false
  end

  def down
    remove_column :spaces, :hidden
  end
end
