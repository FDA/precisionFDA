class CreateUserFiles < ActiveRecord::Migration
  def change
    create_table :user_files do |t|
      t.string :dxid
      t.string :project
      t.string :name
      t.string :state
      t.text :description
      t.belongs_to :user, index: true, foreign_key: true
      t.belongs_to :biospecimen, index: true, foreign_key: true
      t.boolean :public
      t.integer :file_size, limit: 8

      t.timestamps null: false
    end
    add_index :user_files, :state
  end
end
