class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.references :user, index: true, foreign_key: true
      t.references :space, index: true, foreign_key: true
      t.integer :assignee_id, null: false
      t.integer :status, null: false, default: 0
      t.string :name
      t.text :description
      t.datetime :response_deadline
      t.datetime :completion_deadline

      t.timestamps null: false
    end
  end
end
