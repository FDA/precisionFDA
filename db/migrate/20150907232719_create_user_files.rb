class CreateUserFiles < ActiveRecord::Migration[4.2]
  def change
    create_table :user_files do |t|
      t.string :dxid, required: true
      t.string :project, required: true
      t.string :name, required: true
      t.string :state, required: true
      t.text :description
      t.belongs_to :user, index: true, foreign_key: true, required: true
      t.boolean :public, required: true
      t.integer :file_size, limit: 8, required: true

      t.timestamps null: false
    end

    add_index :user_files, :state
  end
end
