class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.integer :item_id, index: true
      t.string :item_type, index: true
      t.string :event_type, index: true
      t.datetime :timestamp
      t.string :scope, index: true
      t.text :meta

      t.references :user, index: true, foreign_key: true
    end
  end
end
