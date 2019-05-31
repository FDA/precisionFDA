class AddNotNullToNotesUserId < ActiveRecord::Migration
  def change
    change_column_null :notes, :user_id, false
  end
end
