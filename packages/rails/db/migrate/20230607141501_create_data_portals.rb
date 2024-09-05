class CreateDataPortals < ActiveRecord::Migration[6.1]
  def change
    create_table :data_portals do |t|
      t.string :name, required: true
      t.text :description
      t.text :content
      t.text :editor_state
      t.string :card_image_url
      t.string :card_image_id
      t.integer :sort_order
      t.string :status
      t.integer :space_id
      t.timestamps null: false
    end
    add_foreign_key "data_portals", "spaces", column: "space_id"

    create_table :resources do |t|
      t.integer :user_id
      t.integer :user_file_id
      t.integer :parent_id
      t.string :parent_type
      t.string :url
      t.text :meta
      t.timestamps null: false
    end
    add_foreign_key "resources", "users", column: "user_id"
    add_foreign_key "resources", "nodes", column: "user_file_id"
  end
end
