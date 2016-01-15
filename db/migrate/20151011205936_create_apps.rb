class CreateApps < ActiveRecord::Migration
  def change
    create_table :apps do |t|
      t.string :dxid
      t.string :version
      t.integer :revision
      t.string :title
      t.text :readme
      t.belongs_to :user, index: true, foreign_key: true
      t.string :scope
      t.text :spec
      t.text :internal

      t.timestamps null: false
    end
    add_index :apps, :dxid
    add_index :apps, :scope
  end
end
