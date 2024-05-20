class CreateNotifications < ActiveRecord::Migration[6.1]
  def change
    create_table :notifications do |t|
      t.string :action, null: false
      t.string :message, limit: 4096
      t.string :severity, null: false
      t.integer :user_id
      t.datetime :delivered_at
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false

      t.index %i(user_id)
    end
  end
end
