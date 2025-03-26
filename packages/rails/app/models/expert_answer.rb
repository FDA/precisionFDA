# == Schema Information
#
# Table name: expert_answers
#
#  id                 :integer          not null, primary key
#  expert_id          :integer
#  expert_question_id :integer
#  body               :text(65535)
#  state              :string(255)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#

class ExpertAnswer < ApplicationRecord
  include Auditor

  belongs_to :expert
  belongs_to :expert_question

  def uid
    "expert-answer-#{id}"
  end

  def klass
    "expert-answer"
  end

  def provision(expert, question, body)
    ExpertAnswer.create!(
      :expert_id => expert.id,
      :expert_question => question.id,
      :body => body
    )
  end

  def editable_by?(context)
    raise if context.user_id.blank?

    expert.user_id == context.user_id
  end
end
