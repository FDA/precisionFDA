class AddEntityTypeToFiles < ActiveRecord::Migration[6.0]
  def change
    add_column :nodes, :entity_type, :integer,
               null: false, default: UserFile.entity_types[UserFile::TYPE_REGULAR]
  end
end
