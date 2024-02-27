class ChangeDataTypeForDataPortals < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL.squish
      ALTER TABLE data_portals
      MODIFY editor_state MEDIUMTEXT,
      MODIFY content MEDIUMTEXT
    SQL
  end

  def down
    change_column :data_portals, :editor_state, :text
    change_column :data_portals, :content, :text
  end
end
