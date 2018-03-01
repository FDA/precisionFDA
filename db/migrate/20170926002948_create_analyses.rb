class CreateAnalyses < ActiveRecord::Migration
  def change
    create_table :analyses do |t|
      t.string :name
      t.string :dxid
      t.integer :user_id

      t.timestamps null: false
    end
    add_index :analyses, :user_id
  end
end
