class AddDefaultToDataPortals < ActiveRecord::Migration[6.1]
  def change
    add_column :data_portals, :default, :boolean, default: false
  end
end
