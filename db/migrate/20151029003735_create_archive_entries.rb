class CreateArchiveEntries < ActiveRecord::Migration
  def change
    create_table :archive_entries do |t|
      t.text :path
      t.string :name
      t.references :asset, index: true, foreign_key: true
    end
    add_index :archive_entries, :name
  end
end
