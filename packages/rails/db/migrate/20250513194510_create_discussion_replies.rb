class CreateDiscussionReplies < ActiveRecord::Migration[6.1]
  REPLY_TYPE_COMMENT = "Comment"
  REPLY_TYPE_ANSWER = "Answer"

  def up
    add_column :answers, :reply_type, :string
    add_column :answers, :parent_id, :integer, null: true, default: nil
    add_index :answers, :parent_id
    add_column :answers, :old_comment_id, :integer, null: true, default: nil
    add_index :answers, :old_comment_id
    add_foreign_key :answers, :comments, column: :old_comment_id

    Answer.update_all(reply_type: REPLY_TYPE_ANSWER)

    comments = Comment.where(commentable_type: "Discussion")
    comments.each do |comment|
      discussion = Discussion.find(comment.commentable_id)
      new_note = Note.create!(
        title: REPLY_TYPE_COMMENT.downcase,
        content: comment.body,
        user_id: comment.user_id,
        scope: discussion.note.scope,
        note_type: REPLY_TYPE_COMMENT,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      )
      Answer.create!(
        user_id: comment.user_id,
        discussion_id: comment.commentable_id,
        note_id: new_note.id,
        reply_type: REPLY_TYPE_COMMENT,
        parent_id: nil,
        old_comment_id: comment.id,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      )
    end

    answer_comments = Comment.where(commentable_type: REPLY_TYPE_ANSWER)
    answer_comments.each do |comment|
      answer = Answer.find(comment.commentable_id)
      new_note = Note.create!(
        title: REPLY_TYPE_COMMENT.downcase,
        content: comment.body,
        user_id: comment.user_id,
        scope: answer.note.scope,
        note_type: REPLY_TYPE_COMMENT,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      )
      Answer.create!(
        user_id: comment.user_id,
        discussion_id: answer.discussion_id,
        note_id: new_note.id,
        reply_type: REPLY_TYPE_COMMENT,
        parent_id: answer.id,
        old_comment_id: comment.id,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
      )
    end
  end

  def down
    comments = Answer.where(reply_type: REPLY_TYPE_COMMENT).delete_all
    notes = Note.where(note_type: REPLY_TYPE_COMMENT).delete_all

    remove_foreign_key :answers, column: :old_comment_id
    remove_index :answers, :old_comment_id

    remove_column :answers, :reply_type
    remove_column :answers, :parent_id
    remove_column :answers, :old_comment_id
  end
end
