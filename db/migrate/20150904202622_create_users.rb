class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :dxuser, required: true
      t.string :private_files_project, required: true
      t.string :public_files_project, required: true
      t.string :private_comparisons_project, required: true
      t.string :public_comparisons_project, required: true
      t.integer :open_files_count, default: 0
      t.integer :closing_files_count, default: 0
      t.integer :pending_comparisons_count, default: 0
      t.integer :schema_version, required: true

      t.timestamps null: false
    end

    add_index :users, :dxuser, unique: true
  end
end
