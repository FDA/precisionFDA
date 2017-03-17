# == Schema Information
#
# Table name: experts
#
#  id            :integer          not null, primary key
#  state         :string
#  image         :string
#  meta          :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class Expert < ActiveRecord::Base
  has_many :expert_questions, dependent: :destroy
  has_many :expert_answers, through: :expert_questions, dependent: :destroy
  belongs_to :user

  store :meta, accessors: [:_intro, :_about], coder: JSON
  attr_accessor :username, :question, :answer

  def uid
    "expert-#{id}"
  end

  def first_name
    user.first_name.capitalize
  end

  def last_name
    user.last_name.capitalize
  end

  def name
    "#{first_name} #{last_name}"
  end

  def title
    name
  end

  def klass
    "expert"
  end

  def active?
    state == "active"
  end

  def open?
    ["active", "open", nil].include?(state)
  end

  def closed?
    state == "closed"
  end

  def open_questions
    expert_questions.select{|q| q.open?}
  end

  def ignored_questions
    expert_questions.select{|q| q.ignored?}
  end

  def answered_questions
    expert_questions.select{|q| q.answered?}
  end

  def commented_questions
    expert_questions.select{|q| q.root_comments.present?}
  end

  def editable_by?(context)
    if !context.logged_in?
        return false
    end
    if !context.guest?
      raise unless context.user_id.present?
      user.id == context.user_id
    end
  end

  def questions_by_user_id(user_id)
    expert_questions.select{|q| q.user.nil? ? user_id.nil? : q.user.id == user_id}
  end

  def self.editable_by(context)
    if !context.guest?
      raise unless context.user_id.present?
      Expert.where(user_id: context.user_id).uniq
    end
  end

  def self.provision(context, expert_params)
    e = nil
    Expert.transaction do
      u = User.find_by(dxuser: expert_params[:username])
      if u.nil?
        return e
      end
      expert_params[:state] = "closed"
      expert_params[:user_id] = u.id
      e = Expert.create!(expert_params)
    end
    return e
  end
end
