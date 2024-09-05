class RemoveHttpsFilesFolders < ActiveRecord::Migration[6.1]
  def up
    execute <<-SQL.squish
      DELETE tg FROM taggings tg
      INNER JOIN nodes n ON n.id = tg.taggable_id INNER JOIN tags t ON tg.tag_id = t.id
      WHERE t.name = 'HTTPS File' AND tg.taggable_type = 'Node' AND n.entity_type = 1
    SQL

    execute <<-SQL.squish
      UPDATE tags
      SET taggings_count = (SELECT count FROM (SELECT count(*) as count FROM tags t INNER JOIN taggings tg ON tg.tag_id = t.id WHERE t.name = 'HTTPS File') as t)
      WHERE name = 'HTTPS File'
    SQL

    remove_column :nodes, :entity_type
  end

  def down
    add_column :nodes, :entity_type, :integer, null: false, default: 0
  end
end
