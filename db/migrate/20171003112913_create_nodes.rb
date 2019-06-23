class CreateNodes < ActiveRecord::Migration[4.2]
  def change
    change_table :user_files do |t|
      t.integer :parent_folder_id
      t.string :sti_type
    end

    rename_table :user_files, :nodes

    reversible do |r|
      r.up do
        execute <<-SQL
          UPDATE nodes SET sti_type = 'UserFile';
        SQL
      end
    end
  end
end
