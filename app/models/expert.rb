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

  store :meta, accessors: [:_intro, :_bio], coder: JSON
  attr_accessor :username

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
    state == "ACTIVE"
  end

  def closed?
    state == "CLOSED"
  end

  def edit_image(new_image)
    update_attributes(image: new_image)
  end

  def editable_by?(context)
    if !context.guest?
      raise unless context.user_id.present?
      user.id == context.user_id
    end
  end

  def questions_by_user_id(user_id)
    expert_questions.select{|q| q.user.id == user_id}
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
      expert_params[:user_id] = u.id
      e = Expert.create!(expert_params)
    end
    return e
  end
end
