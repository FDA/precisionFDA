class CreateWorkflows < ActiveRecord::Migration
  def change
    create_table :workflows do |t|
      t.string :title
      t.string :name
      t.string :dxid
      t.integer :user_id
      t.text :readme
      t.string :edit_version
      t.text :spec
      t.string :default_instance
      t.string :scope
      t.integer :revision
      t.integer :workflow_series_id

      t.timestamps null: false
    end
    add_index :workflows, :user_id
    add_index :workflows, :workflow_series_id
  end
end
