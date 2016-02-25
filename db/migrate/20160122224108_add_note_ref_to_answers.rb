class AddNoteRefToAnswers < ActiveRecord::Migration
  def change
    add_reference :answers, :note, index: true, foreign_key: true
  end
end
