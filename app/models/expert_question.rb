# == Schema Information
#
# Table name: expert_questions
#
#  id            :integer          not null, primary key
#  state         :string
#  body          :text
#  meta          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class ExpertQuestion < ActiveRecord::Base
  include Auditor

  acts_as_commentable

  belongs_to :user
  belongs_to :expert
  has_one :expert_answer, dependent: :destroy

  store :meta, accessors: [:_original, :_edited], coder: JSON
  attr_accessor :answer

  def uid
    "expert-question-#{id}"
  end

  def klass
    "expert-question"
  end

  def title
    body
  end

  def open?
    state == "open"
  end

  def answered?
    state == "answered" && expert_answer.body.present?
  end

  def ignored?
    state == "ignored"
  end

  def update_answer(expert, params)
    if expert_answer.nil?
      ExpertAnswer.create!(
        :expert_id => expert.id,
        :expert_question_id => id,
        :body => params[:expert_question][:answer])
    else
      expert_answer.update_attribute(:body, params[:expert_question][:answer])
    end
  end

  def edited?
    body.present? ? body != _original : false
  end

  def self.provision(expert, context, q_body)
    ExpertQuestion.create!(
      :user_id => context.user_id,
      :expert_id => expert.id,
      :state => "open",
      :body => q_body,
      :_original => q_body,
      :_edited => false.to_s
    )
  end

  def in_space?
    false
  end

  def accessible_by?(context)
    context.logged_in?
  end

  def editable_by?(context)
    if !context.guest?
      raise unless context.user_id.present?
      expert.user_id == context.user_id
    end
  end
end
