# == Schema Information
#
# Table name: comments
#
#  id                  :integer          not null, primary key
#  commentable_id      :integer
#  commentable_type    :string(255)
#  title               :string(255)
#  body                :text(65535)
#  subject             :string(255)
#  user_id             :integer          not null
#  parent_id           :integer
#  lft                 :integer
#  rgt                 :integer
#  created_at          :datetime
#  updated_at          :datetime
#  content_object_id   :integer
#  content_object_type :string(255)
#  state               :integer          default("active")
#

class Comment < ApplicationRecord
  include Auditor
  include Permissions

  STATES = %i(active deleted)

  acts_as_nested_set :scope => [:commentable_id, :commentable_type]

  validates :body, :presence => true
  validates :user, :presence => true

  paginates_per 100

  # NOTE: install the acts_as_votable plugin if you
  # want user to vote on the quality of comments.
  #acts_as_votable

  belongs_to :commentable, polymorphic: true
  belongs_to :content_object, polymorphic: true

  # NOTE: Comments belong to a user
  belongs_to :user

  enum state: STATES

  # Helper class method to lookup all comments assigned
  # to all commentable types for a given user.
  scope :find_comments_by_user, lambda { |user|
    where(user_id: user.id).order("created_at DESC")
  }

  # Helper class method to look up all comments for
  # commentable class name and commentable id.
  scope :find_comments_for_commentable, lambda { |commentable_str, commentable_id|
    where(commentable_type: commentable_str.to_s, commentable_id: commentable_id).
      order("created_at DESC")
  }

  # Helper class method that allows you to build a comment
  # by passing a commentable object, a user_id, and comment text
  # example in readme
  def self.build_from(obj, user_id, comment)
    new \
      :commentable => obj,
      :body        => comment,
      :user_id     => user_id
  end

  # Helper class method to look up a commentable object
  # given the commentable class name and id
  def self.find_commentable(commentable_str, commentable_id)
    commentable_str.constantize.find(commentable_id)
  end

  def klass
    "comment"
  end

  #helper method to check if a comment has children
  def has_children?
    children.any?
  end

  def content_object_name
    method = ["Note", "App", "Workflow"].include?(content_object_type) ? :title : :name
    content_object.send(method)
  end

  def in_space?
    false
  end

  def mentioned_users
    User.where(dxuser: body.scan(/@([^[:space:]]*)/))
  end
end