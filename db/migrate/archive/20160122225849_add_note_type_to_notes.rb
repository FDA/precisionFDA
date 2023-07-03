class AddNoteTypeToNotes < ActiveRecord::Migration[4.2]
  def change
    add_column :notes, :note_type, :string
  end
end
