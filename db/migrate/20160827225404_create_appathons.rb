class CreateAppathons < ActiveRecord::Migration
  def change
    create_table :appathons do |t|
      t.string :name, required: true
      t.references :admin, index: true, foreign_key: true, required: true
      t.references :meta_appathon, index: true, foreign_key: true, required: true
      t.text :description
      t.string :flag
      t.datetime :start_at
      t.datetime :end_at
      t.text :meta

      t.timestamps null: false
    end
  end
end
