class UnlockFolders < ActiveRecord::Migration[6.1]
  def up
    # Create a temporary table to store original 'locked' values
    execute <<-SQL.squish
      CREATE TABLE tmp_locked_folder_nodes_backup AS
      SELECT id FROM nodes WHERE sti_type = 'Folder' AND locked = 1;
    SQL

    # Update nodes where sti_type is 'Folder'
    execute <<-SQL.squish
      UPDATE nodes
      SET locked = 0
      WHERE sti_type = 'Folder'
    SQL
  end

  def down
    # Restore the original 'locked' values from backup table
    execute <<-SQL.squish
      UPDATE nodes
      INNER JOIN tmp_locked_folder_nodes_backup ON nodes.id = tmp_locked_folder_nodes_backup.id
      SET nodes.locked = 1;
    SQL

    # Drop the backup table
    execute "DROP TABLE IF EXISTS tmp_locked_folder_nodes_backup"
  end
end
