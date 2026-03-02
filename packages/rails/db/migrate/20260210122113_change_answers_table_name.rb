class ChangeAnswersTableName < ActiveRecord::Migration[7.1]
  def up
    rename_table :answers, :discussion_replies

    remove_column :discussion_replies, :old_comment_id
  end

  def down
    rename_table :discussion_replies, :answers
  end
end
