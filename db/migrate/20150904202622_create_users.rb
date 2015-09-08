class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :dxuser
      t.string :private_files_project
      t.string :public_files_project
      t.string :private_comparisons_project
      t.string :public_comparisons_project
      t.integer :open_files_count
      t.integer :closing_files_count
      t.integer :pending_comparisons_count
      t.integer :schema_version

      t.timestamps null: false
    end
    add_index :users, :dxuser, unique: true
  end
end
