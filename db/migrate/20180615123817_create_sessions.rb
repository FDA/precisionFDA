class CreateSessions < ActiveRecord::Migration
  def change
    create_table :sessions do |t|
      t.string :key, null: false
      t.belongs_to :user, index: true, null:false
      t.timestamps null: false
    end
  end
end
