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

class Answer < ApplicationRecord
  include Auditor
  # This includes permissions but many methods must be redefined
  # given that the real permissions are mandated by the note
  include Permissions
  include CommonPermissions
  include TagsContainer

  validates :discussion_id, uniqueness: { scope: :user_id }
  belongs_to :user
  belongs_to :discussion
  belongs_to :note, dependent: :destroy

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

  def describe_fields
    ["title", "content"]
  end

  def attachments
    note.attachments
  end

  # Override some permissions methods

  def self.accessible_by(context)
    if context.guest?
      accessible_by_public
    else
      raise unless context.user_id.present? && context.user.present?

      joins(:note).where(user_id: context.user_id).
        or(joins(:note).where({ notes: { scope: Scopes::SCOPE_PUBLIC } }))
    end
  end

  def self.accessible_by_public
    joins(:note).where(notes: { scope: Scopes::SCOPE_PUBLIC })
  end

  def self.accessible_by_space(space)
    joins(:note).where(notes: { scope: space.uid })
  end

  def self.editable_by(context)
    return none unless context.logged_in?

    where(user: context.user)
  end

  def publishable_by?(context, scope_to_publish_to = Scopes::SCOPE_PUBLIC)
    core_publishable_by?(context) &&
      scope_to_publish_to == Scopes::SCOPE_PUBLIC &&
      discussion.public?
  end

  def self.publish(answers, context, scope)
    count = 0
    answers.uniq.each do |answer|
      answer.with_lock do
        if answer.publishable_by?(context, scope)
          answer.note.update!(scope: scope)
          count += 1
        end
      end
    end

    count
  end
end
