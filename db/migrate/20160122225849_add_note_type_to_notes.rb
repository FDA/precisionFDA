class AddParentTypeToNotes < ActiveRecord::Migration
  def change
    add_column :notes, :note_type, :string
  end
end
