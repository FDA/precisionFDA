class CreateSpaceTemplates < ActiveRecord::Migration
  def change
    create_table :space_templates do |t|
      t.string :name
      t.text :description

      t.timestamps null: false
    end
  end
end
