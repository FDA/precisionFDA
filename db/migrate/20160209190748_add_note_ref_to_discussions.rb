class AddNoteRefToDiscussions < ActiveRecord::Migration
  def change
    add_reference :discussions, :note, index: true, foreign_key: true
  end
end
