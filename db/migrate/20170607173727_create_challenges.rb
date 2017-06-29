class CreateChallenges < ActiveRecord::Migration
  def change
    create_table :challenges do |t|
      t.string :name, required: true
      t.references :admin, index: true, required: true
      t.references :app_owner, index: true, required: true
      t.references :app, index: true, required: true
      t.text :description
      t.text :meta
      t.datetime :start_at, required: true
      t.datetime :end_at, required: true

      t.timestamps null: false
    end
    add_foreign_key :challenges, :users, column: 'admin_id'
    add_foreign_key :challenges, :users, column: 'app_owner_id'
    add_foreign_key :challenges, :apps, column: 'app_id'
  end
end
