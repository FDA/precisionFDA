# == Schema Information
#
# Table name: notes
#
#  id         :integer          not null, primary key
#  title      :string(255)
#  content    :text(65535)
#  user_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  scope      :string(255)
#  note_type  :string(255)
#

class Note < ApplicationRecord
  include Auditor
  include Permissions

  belongs_to :user, required: true
  has_one :answer
  has_one :discussion
  has_many :attachments, dependent: :destroy
  has_many :nodes, through: :attachments, source: :item, source_type: "Node"
  has_many :user_files, through: :attachments, source: :item, source_type: "UserFile"
  has_many :apps, through: :attachments, source: :item, source_type: "App"
  has_many :comparisons, through: :attachments, source: :item, source_type: "Comparison"
  has_many :jobs, through: :attachments, source: :item, source_type: "Job"

  acts_as_followable
  acts_as_commentable
  acts_as_taggable
  acts_as_votable

  # Collects note files attachments of both item types: "Node" and "UserFile".
  # @return [ActiveRecord::Relation<UserFile>] selected as real_files by file parent_type.
  def files
    nodes_files = UserFile.where(id: nodes)
    nodes_user_files = UserFile.where(id: user_files)
    nodes_files.or(nodes_user_files).real_files
  end

  def assets
    Asset.where(id: nodes)
  end

  def uid
    "note-#{id}"
  end

  def klass
    "note"
  end

  def title
    if self[:note_type] == "Answer"
      if !self.answer.discussion.nil?
        return "Answer to #{self.answer.discussion.title}"
      else
        return "Answer to a deleted question"
      end
    else
      return self[:title]
    end
  end

  def describe_fields
    ["title", "note_type", "content"]
  end

  def to_param
    return id.to_s unless title

    "#{id}-#{title.parameterize}"
  end

  def real_note?
    note_type.nil?
  end

  def publishable_by?(context, scope_to_publish_to = Scopes::SCOPE_PUBLIC)
    core_publishable_by?(context) && real_note?
  end

  def self.real_notes
    return where(note_type: nil)
  end

  def self.answer_notes
    where(note_type: "Answer")
  end

  def self.discussion_notes
    where(note_type: "Discussion")
  end

  def self.answers
    Answer.where(note_id: answer_notes)
  end

  def self.discussions
    Discussion.where(note_id: discussion_notes)
  end

  def real_files
    files.real_files
  end

  def rename(new_name, context)
    update_attributes(title: new_name)
  end

  def self.publish(notes, context, scope)
    count = 0
    notes.uniq.each do |note|
      note.with_lock do
        if note.publishable_by?(context, scope)
          note.update!(scope: scope)
          count += 1
          if Space.valid_scope?(scope)
            SpaceEventService.call(Space.scope_id(scope), context.user_id, nil, note, :note_added)
          end
        end
      end
    end

    count
  end

  def copyable_to_cooperative?
    in_confidential_space?
  end
end
