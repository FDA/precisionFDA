class CreateProperties < ActiveRecord::Migration[6.1]
  def change
    create_table :properties, primary_key: [:target_id, :target_type, :property_name] do |t|
      t.integer :target_id, null: false
      t.string :target_type, null: false
      t.string :property_name, null: false
      t.string :property_value, null: false
    end
  end
end
