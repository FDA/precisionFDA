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
  include Auditor

  has_many :expert_questions, dependent: :destroy
  has_many :expert_answers, through: :expert_questions, dependent: :destroy
  belongs_to :user

  store :meta, accessors: [:_prefname, :_about, :_blog, :_blog_title, :_challenge, :_image_id], coder: JSON
  attr_accessor :username, :question, :answer

  def klass
    "expert"
  end

  def title
    _prefname.present? ? _prefname : user.full_name.titleize
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

  def total_comment_count
    expert_questions.select{|q| q.root_comments.present?}.map{|q| q.root_comments.count}.sum
  end

  def editable_by?(context)
    return false unless context.logged_in? && !context.guest?

    raise unless context.user_id.present?
    user.id == context.user_id || context.user.can_administer_site?
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

  def self.public
    where(scope: "public")
  end

  def self.viewable_by(context)
    if !context.guest? && context.logged_in?
      if context.user.present? && context.user.can_administer_site?
        Expert.all
      else
        Expert.where("user_id = ? OR scope = ?", context.user_id, "public")
      end
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

  def update_expert(context, expert_params)
    if expert_params[:_image_id].present? && expert_params[:_image_id] != _image_id
      expert_params[:image] = Expert.get_perm_link(context, expert_params[:_image_id])
    end
    update(expert_params)
  end

  def self.get_perm_link(context, id)
    file = UserFile.accessible_by(context).find_by_uid!(id)
    if file.nil? || file.state != "closed" || file.file_size > 5000000
      return nil
    end
    DNAnexusAPI.new(context.token).generate_permanent_link(file)
  end

  def self.provision(context, expert_params)
    e = nil
    Expert.transaction do
      u = User.find_by(dxuser: expert_params[:username])
      if u.nil?
        return e
      end
      expert_params[:image] = Expert.get_perm_link(context, expert_params[:_image_id])
      expert_params[:state] = "closed"
      expert_params[:user_id] = u.id
      e = Expert.create!(expert_params)
    end
    return e
  end
end
