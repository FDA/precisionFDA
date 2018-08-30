class CreateSpaceRequests < ActiveRecord::Migration
  def change
    create_table :space_requests do |t|
      t.integer :status, default: 0
      t.integer :kind, default: 0
      t.belongs_to :space, index: true, foreign_key: true
      t.belongs_to :user, foreign_key: true
      t.timestamps null: false
    end
  end
end
