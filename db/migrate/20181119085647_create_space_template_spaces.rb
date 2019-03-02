class CreateSpaceTemplateSpaces < ActiveRecord::Migration
  def change
    create_table :space_template_spaces do |t|
      t.string :space_id
      t.string :space_template_id

      t.timestamps null: false
    end
  end
end
