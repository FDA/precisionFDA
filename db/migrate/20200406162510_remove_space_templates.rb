class RemoveSpaceTemplates < ActiveRecord::Migration[5.2]
  def change
    drop_table :space_template_spaces, id: :integer, if_exists: true do |t|
      t.string :space_id
      t.string :space_template_id
      t.timestamps null: false
      t.string :space_name
    end

    drop_table :space_template_nodes, id: :integer, if_exists: true do |t|
      t.string :space_template_id
      t.integer :node_id
      t.string :node_type
      t.timestamps null: false
      t.string :space_id
      t.string :node_name

      t.index %i(node_type node_id)
    end

    drop_table :space_templates, id: :integer, if_exists: true do |t|
      t.string :name
      t.text :description
      t.timestamps null: false
      t.boolean :private, null: false, default: false
      t.integer :user_id
    end

    remove_column :spaces, :space_template_id, :integer
  end
end
