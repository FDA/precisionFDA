class CreateArchiveEntries < ActiveRecord::Migration[4.2]
  def change
    create_table :archive_entries do |t|
      t.text :path
      t.string :name
      t.references :asset, index: true
    end
    add_index :archive_entries, :name
    add_foreign_key :archive_entries, :user_files, column: 'asset_id'
  end
end
