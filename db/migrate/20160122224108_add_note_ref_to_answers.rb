class AddNoteRefToAnswers < ActiveRecord::Migration[4.2]
  def change
    add_reference :answers, :note, index: true, foreign_key: true
  end
end
