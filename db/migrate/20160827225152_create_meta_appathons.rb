class CreateMetaAppathons < ActiveRecord::Migration
  def change
    create_table :meta_appathons do |t|
      t.string :name, required: true
      t.string :handle, required: true
      t.string :template
      t.text :description
      t.text :meta
      t.datetime :start_at, required: true
      t.datetime :end_at, required: true

      t.timestamps null: false
    end

    add_index :meta_appathons, :handle, unique: true
  end
end
