# == Schema Information
#
# Table name: tasks
#
#  id                  :integer          not null, primary key
#  user_id             :integer
#  space_id            :integer
#  assignee_id         :integer          not null
#  status              :integer          default("open"), not null
#  name                :string(255)
#  description         :text(65535)
#  response_deadline   :datetime
#  completion_deadline :datetime
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  response_time       :datetime
#  complete_time       :datetime
#

class Task < ApplicationRecord
  belongs_to :user
  belongs_to :space

  validates :assignee_id, presence: true
  validates :name, presence: true, length: { maximum: 255 }

  class << self; undef_method :open; end
  enum status: [:open, :accepted, :declined, :completed, :failed_response_deadline, :failed_completion_deadline]

  scope :active, -> { where(status: [0, 1, 4, 5]) }

  scope :awaiting_response, -> { where(status: [0, 4]) }
  scope :accepted_and_failed_deadline, -> { where(status: [1, 5]) }

  acts_as_commentable

  def assigner
    User.find(user_id)
  end

  def assignee
    User.find(assignee_id)
  end

  def klass
    "task"
  end

  def title
    name
  end

  def source_user?(context)
    user_id == context.user_id
  end

  def target_user?(context)
    assignee_id == context.user_id
  end

  def editable_by?(context)
    if !context.guest?
      raise unless context.user_id.present?
      space.space_memberships.exists?(user_id: context.user_id, role: 'ADMIN')
    end
  end

  def accessible_by?(context)
    return true if context.review_space_admin?
    if !context.guest?
      raise unless context.user_id.present?
      space.space_memberships.exists?(user_id: context.user_id)
    end
  end

  def update_task(params)
    if self.update(params)
      if failed_response_deadline? && (response_deadline > Time.now)
        self.open!
      elsif failed_completion_deadline? && (completion_deadline > Time.now)
        self.accepted!
      end
      true
    end
  end
end
