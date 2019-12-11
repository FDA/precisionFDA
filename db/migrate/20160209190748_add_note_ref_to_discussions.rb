class AddNoteRefToDiscussions < ActiveRecord::Migration[4.2]
  def change
    add_reference :discussions, :note, index: true, foreign_key: true
  end
end
