class FixNotes < ActiveRecord::Migration
  def change
    remove_column :notes, :slug, :string

    create_table :attachments do |t|
      t.belongs_to :note, index: true
      t.references :item, polymorphic: true, index: true
    end
  end
end
