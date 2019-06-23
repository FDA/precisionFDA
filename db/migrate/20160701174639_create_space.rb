class CreateSpace < ActiveRecord::Migration[4.2]
  def change
    create_table :spaces do |t|
      t.string :name, required: true
      t.text :description
      t.string :host_project, required: true
      t.string :guest_project, required: true
      t.string :host_dxorg, required: true
      t.string :guest_dxorg, required: true
      t.string :space_type
      t.string :state
      t.text :meta

      t.timestamps null: false
    end
    add_index :spaces, :state
    add_index :spaces, :space_type
  end
end
