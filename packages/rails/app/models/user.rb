# == Schema Information
#
# Table name: users
#
#  id                          :integer          not null, primary key
#  dxuser                      :string(255)
#  private_files_project       :string(255)
#  public_files_project        :string(255)
#  private_comparisons_project :string(255)
#  public_comparisons_project  :string(255)
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  org_id                      :integer
#  first_name                  :string(255)
#  last_name                   :string(255)
#  email                       :string(255)
#  normalized_email            :string(255)
#  last_login                  :datetime
#  last_data_checkup           :datetime
#  extras                      :text(65535)
#  time_zone                   :string(255)
#  review_app_developers_org   :string(255)      default("")
#  user_state                  :integer          default("enabled"), not null
#  expiration                  :integer
#  disable_message             :string(255)
#

class User < ApplicationRecord
  include Auditor

  EMAIL_FORMAT = %r{
    \A(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.
    [0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\z
  }x.freeze

  # The "schema_version" field is used to denote the schema
  # associated with this user on the platform. Changing the
  # Rails schema (for example, adding a new whatever_project
  # field in user) should increase the current schema below
  # so that users who log in and whose schema_version is
  # lower will get migrated.
  CURRENT_SCHEMA = 1

  enum user_state: { enabled: 0, locked: 1, deactivated: 2 }

  has_many :uploaded_files, class_name: "UserFile", dependent: :restrict_with_exception, as: "parent"
  has_many :user_files
  has_many :nodes
  has_many :assets
  has_many :comparisons
  has_many :notes
  has_many :apps
  has_many :app_series
  has_many :jobs
  has_many :discussions
  has_many :answers
  belongs_to :org
  has_many :licenses
  has_many :accepted_licenses
  has_many :admin_memberships, dependent: :destroy
  has_many :admin_groups, through: :admin_memberships
  has_many :space_memberships
  has_many :spaces, -> { where("space_memberships.active = ?", true) }, through: :space_memberships
  has_many :data_portals, through: :spaces
  has_one :appathon
  has_many :meta_appathons
  has_one :expert, dependent: :destroy
  has_many :challenge_app_owners, class_name: "Challenge", foreign_key: "app_owner_id"
  has_many :submissions
  has_many :challenge_resources
  has_many :analyses
  has_one :usage_metric
  has_many :workflows
  has_one :notification_preference
  has_one :profile, dependent: :destroy
  has_one :invitation, dependent: :nullify
  has_many :org_action_requests,
           inverse_of: :initiator,
           foreign_key: :initiator_id,
           dependent: :destroy

  store :extras, accessors: [:has_seen_guidelines, :inactivity_email_sent], coder: JSON
  store :cloud_resource_settings,
        accessors: %i(charges_baseline pricing_map job_limit total_limit resources),
        coder: JSON

  include Gravtastic
  gravtastic secure: true, default: "retro"

  acts_as_voter
  acts_as_followable
  acts_as_follower
  acts_as_tagger

  scope :real, -> { where.not(dxuser: CHALLENGE_BOT_DX_USER) }
  scope :pending, -> { where.not(last_login: nil) }
  scope :belongs_to_org, ->(org_id) { where(org_id: org_id) }

  scope :site_admins, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_SITE_ADMIN })
  }

  # Have the ability to create new review spaces and have full access to
  # activities available within reviewer and cooperative areas.
  scope :review_space_admins, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_REVIEW_SPACE_ADMIN })
  }

  scope :challenge_admins, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_CHALLENGE_ADMIN })
  }

  scope :challenge_evaluators, lambda {
    joins(:admin_groups).where(admin_groups: { role: AdminGroup::ROLE_CHALLENGE_EVALUATOR })
  }

  validates :first_name,
            length: { minimum: 2, message: "The first name must be at least two letters long." },
            presence: true
  validates :last_name,
            length: { minimum: 2, message: "The last name must be at least two letters long." },
            presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: EMAIL_FORMAT
  validates :disable_message,
            length: {
              maximum: 250, message: "Deactivation reason is too long (over 250 characters)"
            }

  class << self
    def challenge_bot
      find_by!(dxuser: CHALLENGE_BOT_DX_USER)
    end

    # Selects users, according search string.
    # Users selected are the given org members and are not in 'pending' state.
    # @param search [String] - search string
    # @param org [String] - org handle string
    # @return [ActiveRecord::Relation<User>] - an array of users, searched by search string match.
    def org_members(search, org)
      org = Org.find_by(handle: org)
      org_id = org&.id

      query = "%" + sanitize_sql_like(search) + "%"
      users = User.arel_table

      where(users[:dxuser].matches(query).
        or(users[:first_name].matches(query)).
        or(users[:last_name].matches(query))).
        belongs_to_org(org_id).
        pending.
        limit(ORG_MEMBERS_SEARCH_LIMIT)
    end

    def set_legacy_org_baseline_charges!(org_id, charges)
      belongs_to_org(org_id).
        # Note(samuel) this part is potentially slow
        # Tried .update_all(charges_baseline: charges)
        # Didn't work, most likely ActiveRecord bulk updating doesn't work that well with JSON types
        each { |u| u.update(charges_baseline: charges) }
    end

    def validate_email(email)
      EMAIL_FORMAT =~ email
    end

    def validate_state(state, zip_code)
      Country.state_matches_zip_code?(state, zip_code)
    end

    def construct_username(first, last)
      "#{first.downcase.gsub(/[^a-z]/, '')}.#{last.downcase.gsub(/[^a-z]/, '')}"
    end

    def authserver_acceptable?(username)
      username.size >= 3 && username.size <= 255 && username =~ /^[a-z][0-9a-z_\.]{2,}$/
    end
  end

  def active_leave_org_request
    org_action_requests.leave.find_by(org: org)
  end

  def challenge_bot?
    dxuser == CHALLENGE_BOT_DX_USER
  end

  def uid
    "user-#{id}"
  end

  def dxid
    "user-#{dxuser}"
  end

  def klass
    "user"
  end

  def status
    if last_login.nil?
      "Pending"
    else
      case user_state
      when "enabled"
        "Active"
      when "deactivated"
        "Disabled"
      else
        "N/A"
      end
    end
  end

  def org
    challenge_bot? ? Org.new : super
  end

  delegate :real_files, to: :user_files

  def guest?
    dxuser.start_with?("Guest-")
  end

  def singular?
    org_id.blank? || org.singular
  end

  def can_provision_accounts?
    !singular? && org.admin_id == id
  end

  def billto
    org.dxorg
  end

  # Returns all accessible space scopes.
  # @return [Array] Space scopes (UIDs).
  def space_uids
    Space.accessible_by(self).pluck(Arel.sql("concat('space-', spaces.id)"))
  end

  def activated?
    private_files_project.present? && last_login.present?
  end

  def username
    dxuser
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  def initials
    "#{first_name[0]}#{last_name[0]}"
  end

  def select_text
    "#{username} (#{full_name.titleize}, #{org.name})"
  end

  def logged_in?
    !Session.find_by(user_id: id).expired?
  rescue StandardError
    false
  end

  def appathon_from_meta(meta_appathon)
    following_by_type("Appathon").find do |appathon|
      appathon.meta_appathon.uid == meta_appathon.uid
    end
  end

  def can_administer_site?
    admin_groups.any?(&:site?)
  end

  def challenge_admin?
    admin_groups.any?(&:challenge_admin?)
  end

  def is_challenge_evaluator?
    challenge_eval? || can_administer_site?
  end

  # Government user: check if user have either fda.hhs.gov or fda.gov email
  def self.government_email?(email)
    email =~ URI::MailTo::EMAIL_REGEXP && %w(fda.hhs.gov fda.gov).include?(email.split("@").last)
  end

  def government_user?
    User.government_email?(email)
  end

  def challenge_eval?
    admin_groups.any?(&:challenge_eval?)
  end

  def review_space_admin?
    admin_groups.any?(&:space?)
  end

  def site_or_challenge_admin?
    can_administer_site? || challenge_admin?
  end

  # Checks if a user can create spaces.
  # @return [Boolean] Returns true if a user can create spaces, false otherwise.
  def can_create_spaces?
    can_administer_site? || review_space_admin?
  end

  def can_see_spaces?
    return true if can_create_spaces?

    space_memberships.active.count.positive?
  end

  def can_create_challenges?
    site_or_challenge_admin?
  end

  def can_access_notification_preference?
    spaces.review.any?
  end

  # @param time_zone [String] new time zone
  def update_time_zone(time_zone)
    update(time_zone: time_zone) if Time.find_zone(time_zone)
  end

  def can_run_jobs?
    job_limit.positive?
  end

  def allowed_to_publish?
    admin_groups.any?
  end

  alias_method :site_admin?, :can_administer_site?
end
