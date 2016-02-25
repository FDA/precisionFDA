# == Schema Information
#
# Table name: discussions
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  note_id    :integer
#

class Discussion < ActiveRecord::Base
  include Permissions

  belongs_to :user
  has_many :answers
  belongs_to :note

  acts_as_commentable
  acts_as_votable
  acts_as_followable

  def uid
    "discussion-#{id}"
  end

  def klass
    "discussion"
  end

  def title
    note.title
  end

  def content
    note.content
  end

  def scope
    note.scope
  end

  def attachments
    note.attachments
  end

  def to_param
    if title.nil?
      id.to_s
    else
      "#{id}-#{title.parameterize}"
    end
  end

  def answer_for_user(user_id)
    answers.where(user_id: user_id).take
  end

  def has_answered?(user_id)
    answers.where(user_id: user_id).count > 0
  end

  def accessible_by?(context)
    note.accessible_by?(context)
  end

  def self.accessible_by(context)
    if context.guest?
      accessible_by_public
    else
      raise unless context.user_id.present? && context.org_id.present?
      joins(:note).where.any_of({user_id: context.user_id}, {notes: {scope: "public"}}, {notes: {scope: context.org_id.to_s}})
    end
  end

  def self.accessible_by_public
    joins(:note).where(notes: {scope: "public"})
  end
end
