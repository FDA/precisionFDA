class SpaceMembership < ActiveRecord::Base
  include Auditor

  SIDE_HOST = 'host'
  SIDE_GUEST = 'guest'

  ROLE_LEAD   = 'lead'
  ROLE_ADMIN  = 'admin'
  ROLE_MEMBER = 'member'
  ROLE_VIEWER = 'viewer'

  belongs_to :user
  has_one :notification_preference, through: :user
  has_and_belongs_to_many :spaces, dependent: :destroy

  store :meta, { coder: JSON }

  enum role: [ROLE_ADMIN, ROLE_MEMBER, ROLE_VIEWER, ROLE_LEAD]
  enum side: [SIDE_HOST, SIDE_GUEST]

  scope :active, -> { where(active: true) }
  scope :lead_or_admin, -> { where.any_of(lead, admin) }

  def self.new_by_admin(user)
    new(side: SIDE_HOST, role: ROLE_ADMIN, user: user)
  end

  def self.subscribed_to(subscription)
    includes(:notification_preference)
      .select { |member| member.notification_preference.send(subscription) }
  end

  def notification_preference
    super || NotificationPreference.new
  end

  def inactive?
    !active?
  end

  def lead_or_admin?
    lead? || admin?
  end

  def lead_or_admin_or_member?
    lead_or_admin? || member?
  end

  def custom_role
    { role => self[:role] }
  end

end
