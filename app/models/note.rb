# == Schema Information
#
# Table name: notes
#
#  id         :integer          not null, primary key
#  title      :string
#  content    :text
#  user_id    :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  scope      :string
#  note_type  :string
#

class Note < ActiveRecord::Base
  include Permissions

  belongs_to :user
  has_one :answer, dependent: :destroy
  has_one :discussion, dependent: :destroy
  has_many :attachments, {dependent: :destroy}
  has_many :apps, {through: :attachments, source: :item, source_type: 'App'}
  has_many :comparisons, {through: :attachments, source: :item, source_type: 'Comparison'}
  has_many :jobs, {through: :attachments, source: :item, source_type: 'Job'}
  has_many :files, {through: :attachments, source: :item, source_type: 'UserFile'}

  acts_as_followable

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

  def to_param
    if title.nil?
      id.to_s
    else
      "#{id}-#{title.parameterize}"
    end
  end

  def real_note?
    note_type.nil?
  end

  def self.real_notes
    return where(note_type: nil)
  end

  def self.answer_notes
    return where(note_type: 'Answer')
  end

  def self.discussion_notes
    return where(note_type: 'Discussion')
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

  def assets
    files.where(parent_type: "Asset")
  end
end
