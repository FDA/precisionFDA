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
  include Auditor
  # This includes permissions but many methods must be redefined
  # given that the real permissions are mandated by the note
  include Permissions

  belongs_to :user
  has_many :answers, dependent: :destroy
  belongs_to :note, dependent: :destroy

  acts_as_commentable
  acts_as_votable
  acts_as_followable
  acts_as_taggable

  def self.can_be_in_space?
    false
  end

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

  def describe_fields
    ["title", "content"]
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

  # Override some permissions methods

  def self.accessible_by(context)
    if context.guest?
      accessible_by_public
    else
      raise unless context.user_id.present? && context.user.present?
      joins(:note).where.any_of({user_id: context.user_id}, {notes: {scope: "public"}})
    end
  end

  def self.accessible_by_public
    joins(:note).where(notes: {scope: "public"})
  end

  def self.accessible_by_space(space)
    joins(:note).where(notes: {scope: space.uid})
  end

  def publishable_by?(context, scope_to_publish_to = "public")
    core_publishable_by?(context, scope_to_publish_to) && scope_to_publish_to == "public"
  end

  def rename(new_name, context)
    note.rename(new_name, context)
  end

  def self.publish(discussions, context, scope)
    count = 0
    discussions.uniq.each do |discussion|
      discussion.with_lock do
        if discussion.publishable_by?(context, scope)
          discussion.note.update!(scope: scope)
          count += 1
        end
      end
    end

    return count
  end
end
