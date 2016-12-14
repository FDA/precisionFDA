class AddCommentTypeToComments < ActiveRecord::Migration
  def change
    add_column :comments, :comment_type, :string

    Comment.find_each { |c| c.update!(:comment_type => "comment") if c.comment_type.nil? }
  end
end
