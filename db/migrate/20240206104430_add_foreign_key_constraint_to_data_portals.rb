class AddForeignKeyConstraintToDataPortals < ActiveRecord::Migration[6.1]
  def up
    # Change column type
    change_column :data_portals, :card_image_id, :integer

    # Add foreign key constraint
    add_foreign_key :data_portals, :nodes, column: :card_image_id
  end

  def down
    # Remove foreign key constraint
    remove_foreign_key :data_portals, column: :card_image_id

    # Revert column type to varchar
    change_column :data_portals, :card_image_id, :string
  end
end
