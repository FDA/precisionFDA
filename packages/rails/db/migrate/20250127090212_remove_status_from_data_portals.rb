class RemoveStatusFromDataPortals < ActiveRecord::Migration[6.1]
  def up
    remove_column :data_portals, :status, :string
  end

  def down
    add_column :data_portals, :status, :string
  end
end
