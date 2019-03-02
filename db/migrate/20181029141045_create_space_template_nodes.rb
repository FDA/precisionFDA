class CreateSpaceTemplateNodes < ActiveRecord::Migration
  def change
    create_table :space_template_nodes do |t|
      t.string :space_template_id
      t.references :node, polymorphic: true, index: true

      t.timestamps null: false
    end
  end
end
