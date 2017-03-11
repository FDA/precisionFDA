# == Schema Information
#
# Table name: expert_answers
#
#  id            :integer          not null, primary key
#  body          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class ExpertAnswer < ActiveRecord::Base
  acts_as_commentable

  belongs_to :expert
  belongs_to :expert_question

  def uid
    "expert-answer-#{id}"
  end

  def klass
    "expert-answer"
  end

  def editable_by?(context)
    if !context.guest?
      raise unless context.user_id.present?
      expert.user_id == context.user_id
    end
  end
end
