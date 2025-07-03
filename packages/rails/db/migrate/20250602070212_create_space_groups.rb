class CreateSpaceGroups < ActiveRecord::Migration[6.1]
  def change
    create_table :space_groups do |t|
      t.string :name, required: true
      t.text :description, required: true
      t.timestamps null: false
    end

    create_table :space_group_spaces do |t|
      t.bigint :space_group_id
      t.integer :space_id
      t.datetime :created_at, null: false, default: -> { "CURRENT_TIMESTAMP" }
      t.datetime :updated_at, null: false, default: -> { "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
    end
    add_foreign_key "space_group_spaces", "space_groups", column: :space_group_id, on_delete: :cascade
    add_foreign_key "space_group_spaces", "spaces", column: "space_id"
  end
end
