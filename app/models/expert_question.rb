# == Schema Information
#
# Table name: expert_questions
#
#  id            :integer          not null, primary key
#  state         :string
#  body          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class ExpertQuestion < ActiveRecord::Base
  belongs_to :user
  belongs_to :expert
  has_one :expert_answer, dependent: :destroy

  def uid
    "expert-question-#{id}"
  end

  def klass
    "expert-question"
  end

  def answered?
    state = "answered"
  end

  def ignored?
    state == "ignored"
  end

  def edited?
    state == "edited"
  end

  def self.provision(expert, context, body)
    q = ExpertQuestion.create!(
      :user_id => context.logged_in? ? context.user.id : nil,
      :expert_id => expert.id,
      :body => body
    )
  end

  def editable_by?(context)
    if !context.guest?
      raise unless context.user_id.present?
      expert.user_id == context.user_id
    end
 end
end
