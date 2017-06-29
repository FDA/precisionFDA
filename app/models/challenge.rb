# == Schema Information
#
# Table name: challenges
#
#  id               :integer          not null, primary key
#  name             :string
#  description      :text
#  start_at         :datetime
#  end_at           :datetime
#  meta             :text
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class Challenge < ActiveRecord::Base
  belongs_to :admin, {class_name: 'User', foreign_key: 'admin_id'}
  belongs_to :app_owner, {class_name: 'User', foreign_key: 'app_owner_id'}
  belongs_to :app, {class_name: 'App', foreign_key: 'app_id'}

  has_many :submissions, dependent: :destroy

  acts_as_followable

  store :meta, accessors: [], coder: JSON

  def uid
    "challenge-#{id}"
  end

  def klass
    "challenge"
  end

  def handle
    "#{name.parameterize}"
  end

  def title
    name
  end

  def accessible_by?(context)
    context.logged_in?
  end

  def editable_by?(context)
    context.logged_in? && (admin_id == context.user_id || context.user.can_administer_site?)
  end

  def active?
    start_at < DateTime.now && DateTime.now < end_at && app_id.present?
  end

  def over?
    DateTime.now >= end_at
  end

  def member_ids
    followers.map(&:id)
  end

  def self.provision(context, challenge_params)
    Challenge.transaction do
      challenge_params[:admin_id] = context.user.id
      Challenge.create!(challenge_params)
    end
  end

  def self.add_app_dev(context, challenge_id, app_id)
    api = DNAnexusAPI.new(context.token)
    Challenge.transaction do
      app = App.find_by(id: app_id)
      user = User.find_by(dxuser: CHALLENGE_BOT_DX_USER)
      api.call(app.dxid, "addDevelopers", {developers: [user.dxid]})
      challenge = Challenge.find_by(id: challenge_id)
      challenge.update!(app_id: app_id)
    end
  end

  def self.active
    where("start_at < ?", DateTime.now).where("? < end_at", DateTime.now)
  end

  def self.current
    if self.active.present?
      self.active.last
    else
      last
    end
  end
end
