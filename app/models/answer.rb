# == Schema Information
#
# Table name: answers
#
#  id            :integer          not null, primary key
#  user_id       :integer
#  discussion_id :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  note_id       :integer
#

class Answer < ActiveRecord::Base
  include Permissions
  validates :discussion_id, uniqueness: {scope: :user_id}
  belongs_to :user
  belongs_to :discussion
  belongs_to :note

  acts_as_commentable
  acts_as_votable

  def uid
    "answer-#{id}"
  end

  def to_param
    user.dxuser
  end

  def klass
    "answer"
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
