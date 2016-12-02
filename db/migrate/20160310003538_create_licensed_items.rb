class CreateLicensedItems < ActiveRecord::Migration
  def change
    create_table :licensed_items do |t|
      t.references :license, index: true, foreign_key: true
      t.references :licenseable, polymorphic: true, index: true

      t.timestamps null: false
    end
  end
end
