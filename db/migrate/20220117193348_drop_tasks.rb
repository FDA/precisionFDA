class DropTasks < ActiveRecord::Migration[6.1]
  def up
    Comment.where(commentable_type: "Task").destroy_all
    drop_table :tasks
  end

  def down
    create_table :tasks do |t|
      t.references :user, index: true, foreign_key: true, type: :integer
      t.references :space, index: true, foreign_key: true, type: :integer
      t.integer :assignee_id, null: false
      t.integer :status, null: false, default: 0
      t.string :name
      t.text :description
      t.datetime :response_deadline
      t.datetime :completion_deadline
      t.datetime :response_time
      t.datetime :complete_time

      t.timestamps null: false
    end
  end
end
