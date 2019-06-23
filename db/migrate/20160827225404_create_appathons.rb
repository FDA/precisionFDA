class CreateAppathons < ActiveRecord::Migration[4.2]
  def change
    create_table :appathons do |t|
      t.string :name, required: true
      t.references :admin, index: true, required: true
      t.references :meta_appathon, index: true, foreign_key: true, required: true
      t.text :description
      t.string :flag
      t.string :location
      t.datetime :start_at
      t.datetime :end_at
      t.text :meta

      t.timestamps null: false
    end

    add_foreign_key :appathons, :users, column: 'admin_id'
  end
end
