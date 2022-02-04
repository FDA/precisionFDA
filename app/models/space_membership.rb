# == Schema Information
#
# Table name: space_memberships
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  meta       :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  active     :boolean          default(TRUE)
#  role       :integer          default("admin"), not null
#  side       :integer          default("host"), not null
#

class SpaceMembership < ApplicationRecord
  include Auditor

  SIDE_HOST = "host".freeze
  SIDE_GUEST = "guest".freeze

  SIDE_HOST_ALIAS = "reviewer".freeze
  SIDE_GUEST_ALIAS = "sponsor".freeze

  ROLE_LEAD   = "lead".freeze
  ROLE_ADMIN  = "admin".freeze
  ROLE_CONTRIBUTOR = "contributor".freeze
  ROLE_VIEWER = "viewer".freeze

  DISABLE = "disable".freeze
  ENABLE = "enable".freeze

  ROLES = [ROLE_LEAD, ROLE_ADMIN, ROLE_CONTRIBUTOR, ROLE_VIEWER].freeze

  ROLES_CAN_EDIT = [ROLE_LEAD, ROLE_ADMIN, ROLE_CONTRIBUTOR].freeze

  belongs_to :user
  has_one :notification_preference, through: :user
  has_and_belongs_to_many :spaces, dependent: :destroy

  store :meta, { coder: JSON }

  enum role: {
    ROLE_ADMIN => 0,
    ROLE_CONTRIBUTOR => 1,
    ROLE_VIEWER => 2,
    ROLE_LEAD => 3,
  }

  enum side: [SIDE_HOST, SIDE_GUEST]

  scope :active, -> { where(active: true) }
  scope :lead_or_admin, -> { where(role: [ROLE_LEAD, ROLE_ADMIN]) }

  delegate :review_space_admin?, :site_admin?, to: :user

  class << self
    def new_by_admin(user)
      new(side: SIDE_HOST, role: ROLE_ADMIN, user: user)
    end

    def subscribed_to(subscription)
      includes(:notification_preference).
        select { |member| member.notification_preference.send(subscription) }
    end
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

  def lead_or_admin_or_contributor?
    lead_or_admin? || contributor?
  end

  def custom_role
    { role => self[:role] }
  end

  def side_alias
    if spaces.first&.review?
      host? ? SIDE_HOST_ALIAS : SIDE_GUEST_ALIAS
    else
      host? ? SIDE_HOST : SIDE_GUEST
    end
  end
end
