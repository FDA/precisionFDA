class CreateApps < ActiveRecord::Migration
  def change
    create_table :apps do |t|
      t.string :dxid
      t.string :series
      t.string :project
      t.string :version
      t.boolean :is_latest
      t.boolean :is_applet
      t.string :name
      t.string :title
      t.text :readme
      t.belongs_to :user, index: true, foreign_key: true
      t.string :scope
      t.text :spec
      t.text :internal

      t.timestamps null: false
    end
    add_index :apps, :dxid
    add_index :apps, :is_latest
    add_index :apps, :is_applet
    add_index :apps, :scope
  end
end
