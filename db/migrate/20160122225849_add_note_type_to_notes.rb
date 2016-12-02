class AddNoteTypeToNotes < ActiveRecord::Migration
  def change
    add_column :notes, :note_type, :string
  end
end
