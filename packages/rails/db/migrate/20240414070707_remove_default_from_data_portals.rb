class RemoveDefaultFromDataPortals < ActiveRecord::Migration[6.1]
  def change
    remove_column :data_portals, :default
  end
end
