# == Schema Information
#
# Table name: experts
#
#  id            :integer          not null, primary key
#  state         :string
#  image         :string
#  scope         :string
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

  def klass
    "expert"
  end

  def uid
    "expert-#{id}"
  end

  def is_public?
    scope == "public"
  end

  def open?
    ["open"].include?(state)
  end

  def closed?
    ["closed"].include?(state)
  end

  def askable?
    is_public? && open?
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
    return false unless context.logged_in? && !context.guest?

    raise unless context.user_id.present?
    user.id == context.user_id || user.can_administer_site?
  end

  def questions_by_user_id(user_id)
    expert_questions.select{|q| q.user.nil? ? user_id.nil? : q.user.id == user_id}
  end

  def self.open
    where.not(state: "closed")
  end

  def self.closed
    where(state: "closed")
  end

  def self.viewable_by(context)
    if context.user.present? && context.user.can_administer_site?
      Expert.all
    elsif context.logged_in? && !context.guest?
      Expert.where("user_id = ? OR scope = ?", context.user_id, "public")
    else
      Expert.where(scope: "public")
    end
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
