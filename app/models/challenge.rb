# == Schema Information
#
# Table name: challenges
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  admin_id             :integer
#  app_owner_id         :integer
#  app_id               :integer
#  description          :text(65535)
#  meta                 :text(16777215)
#  start_at             :datetime
#  end_at               :datetime
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  status               :string(255)
#  automated            :boolean          default(TRUE)
#  card_image_url       :string(255)
#  card_image_id        :string(255)
#  space_id             :integer
#  specified_order      :integer
#  scope                :string(255)      default("public"), not null
#  pre_registration_url :string(255)
#

class Challenge < ApplicationRecord
  paginates_per 5
  include Auditor

  STATUS_SETUP =    "setup".freeze
  STATUS_PRE_REGISTRATION = "pre-registration".freeze
  STATUS_OPEN =     "open".freeze
  STATUS_PAUSED =   "paused".freeze
  STATUS_ARCHIVED = "archived".freeze
  STATUS_RESULT_ANNOUNCED = "result_announced".freeze

  belongs_to :app_owner, class_name: "User"
  belongs_to :app

  belongs_to :space
  has_many :submissions, dependent: :destroy
  has_many :jobs, through: :submissions
  has_many :challenge_resources, dependent: :destroy

  acts_as_followable

  after_create :initialize_order
  after_save :send_email_on_open,
             if: proc { |ch|
                   [
                     STATUS_SETUP,
                     STATUS_PRE_REGISTRATION,
                   ].include?(ch.status_previous_change&.first) &&
                     ch.status_previous_change&.last == STATUS_OPEN
                 }

  after_save :send_email_on_prereg,
             if: proc { |ch| ch.status_previous_change&.last == STATUS_PRE_REGISTRATION }

  attr_accessor :replacement_id
  store :meta, accessors: [:regions], coder: JSON

  scope :automated, -> { where(automated: true) }
  scope :not_status, ->(status) { where.not(status: status) }
  scope :archived, -> { where(status: STATUS_ARCHIVED) }

  scope :accessible_by, lambda { |context|
    if context.challenge_admin?
      all
    else
      not_status(STATUS_SETUP).
        where(scope: [Scopes::SCOPE_PUBLIC] + (context.user&.space_uids || []))
    end
  }

  delegate :setup?, :active?, :coming_soon?, :paused?, :closed?, :archived?, :result_announced?, to: :state

  validates :start_at, :end_at, presence: true
  validates :title, length: { maximum: 150 }
  validates :description, length: { maximum: 50_000 }

  validates :status, inclusion: { in: ->(challenge) { challenge.available_statuses } }
  validates :meta, meta: true
  validates :app_id,
            presence: { message: "The scoring app user must select an app for the challenge first" },
            unless: :status_setup_or_pre_registration?
  validates :pre_registration_url,
            presence: true,
            if: :status_pre_registration?
  validate :validate_end_at
  validate :validate_start_at
  validate :can_open?, if: :status_open?
  validate :scope_should_be_valid

  attr_accessor :host_lead_dxuser, :guest_lead_dxuser

  class << self
    def available_statuses
      [
        STATUS_SETUP,
        STATUS_PRE_REGISTRATION,
        STATUS_OPEN,
        STATUS_PAUSED,
        STATUS_ARCHIVED,
        STATUS_RESULT_ANNOUNCED,
      ]
    end

    def add_app_dev(context, challenge_id, app_id)
      result = false
      api = DNAnexusAPI.new(context.token)

      transaction do
        app = App.find_by(id: app_id)
        user = User.challenge_bot
        api.call(app.dxid, "addDevelopers", developers: [user.dxid])
        challenge = Challenge.find_by!(id: challenge_id)
        challenge.update!(app_id: app_id)
        result = true
      end

      result
    end

    def app_owned_by(context)
      return none unless context.logged_in?

      where(app_owner_id: context.user_id).where("end_at > ?", DateTime.now)
    end

    def current
      not_status(STATUS_ARCHIVED).last
    end
  end

  def regions
    super || {}
  end

  def uid
    "challenge-#{id}"
  end

  def klass
    "challenge"
  end

  def handle
    name.parameterize.to_s
  end

  # Add string "Challenge" to challenge name if it does not contain such word.
  # Usage in a challenges cards on Main#index
  # @param name [String] challenge name from the model
  # @return [String] name to display, modified with a word "Challenge" appending or
  #  not modified, if it has such word already.
  def modified_name(name)
    name =~ /challenge/i ? name : name.concat(" Challenge")
  end

  def title
    name
  end

  def accessible_by?(context)
    self.class.accessible_by(context).exists?(id)
  end

  def editable_by?(context_or_user)
    user = context_or_user.is_a?(User) ? context_or_user : context_or_user.user

    user.site_or_challenge_admin?
  end

  def space_member?(user)
    space&.space_memberships&.map(&:user_id)&.include?(user.id)
  end

  def status_setup?
    status == STATUS_SETUP
  end

  def status_pre_registration?
    status == STATUS_PRE_REGISTRATION
  end

  def status_setup_or_pre_registration?
    status == STATUS_SETUP || status == STATUS_PRE_REGISTRATION
  end

  def status_open?
    status == STATUS_OPEN
  end

  def status_paused?
    status == STATUS_PAUSED
  end

  def status_result_announced?
    status == STATUS_RESULT_ANNOUNCED
  end

  def status_archived?
    status == STATUS_ARCHIVED
  end

  def status_result_announced!
    update!(status: STATUS_RESULT_ANNOUNCED)
  end

  def state
    @state ||= State.new(self)
  end

  def available_statuses
    return [STATUS_SETUP, STATUS_PRE_REGISTRATION] if new_record?
    return [STATUS_RESULT_ANNOUNCED, STATUS_ARCHIVED, status].uniq if over?
    return [STATUS_OPEN, STATUS_PAUSED, status].uniq if started?

    [STATUS_SETUP, STATUS_PRE_REGISTRATION, STATUS_OPEN, STATUS_PAUSED, status].uniq
  end

  # not available statuses for select!
  def not_available_statuses
    (self.class.available_statuses - available_statuses) + [STATUS_RESULT_ANNOUNCED]
  end

  def started?
    return false if new_record?

    DateTime.now >= start_at_was
  end

  def over?
    return false if new_record?

    DateTime.now >= end_at_was
  end

  def accepting_submissions?
    active? && app_id.present?
  end

  def can_announce_result?
    return false if result_announced?

    closed?
  end

  # Checks if user can assign a new app to a challenge.
  # @param context [Context] User context.
  # @param checked_app [App] Assignable app.
  # @return [Boolean] Returns true if user can assign a new app to a challenge,
  #   false otherwise.
  def can_assign_specific_app?(context, checked_app)
    if !context.logged_in? ||
       over? ||
       ![STATUS_PAUSED, STATUS_SETUP, STATUS_PRE_REGISTRATION].include?(status) ||
       app_owner != context.user ||
       app_id == checked_app.id
      false
    else
      true
    end
  end

  def public?
    scope == Scopes::SCOPE_PUBLIC
  end

  def space_challenge?
    Space.valid_scope?(scope)
  end

  def member_ids
    followers.map(&:id)
  end

  def output_names
    return [] unless app

    app.output_spec.map { |output| output["name"] }
  end

  def completed_submissions
    submissions.includes(:job, user: :org).select { |submission| submission.job.done? }
  end

  def can_show_results?(context)
    return true if context.challenge_evaluator?

    status_result_announced? || status_archived?
  end

  def update_card_image_url!
    return unless previous_changes.key?(:card_image_id)
    return if card_image_id.blank?

    card_image = UserFile.find_by!(uid: card_image_id)
    update(
      card_image_url: DNAnexusAPI.for_challenge_bot.generate_permanent_link(card_image),
    )
  end

  # Updates specified_order of challenges setting challenge to appear after replacement challenge.
  # Usage in edit on Challenges#edit
  def update_order(replacement_id)
    return unless replacement_id && replacement_id.to_i != id

    replacement_challenge = Challenge.find(replacement_id)
    order_array = Challenge.order(specified_order: "desc").pluck(:id)
    order_array.delete(id)
    order_array.insert(order_array.index(replacement_challenge.id) + 1, id)
    ids = Challenge.order(id: "desc").pluck(:id)
    order_array.each.with_index do |o, i|
      Challenge.find(o).update(specified_order: ids[i])
    end
  end

  # Provisions a new group space for each challenge
  # with host lead and guest lead selected by challenge creator
  def provision_space!(context, host_lead_dxuser, guest_lead_dxuser)
    space_form = SpaceForm.new(
      name: name,
      description: description,
      host_lead_dxuser: host_lead_dxuser,
      guest_lead_dxuser: guest_lead_dxuser,
      space_type: SpaceForm::TYPE_GROUPS,
    )

    space = SpaceService::Create.call(
      space_form,
      api: context.api,
      user: context.user,
      for_challenge: true,
    )

    update!(space: space)
  end

  private

  # Add specified_order to challenge equal to it's id.
  # Usage in a challenges create on Challenges#new
  def initialize_order
    self.specified_order = id
  end

  def send_email_on_open
    email_type_id = NotificationPreference.email_types[:notification_challenge_opened]
    client = DIContainer.resolve("https_apps_client")
    client.email_send(email_type_id, { challengeId: id })
  end

  def send_email_on_prereg
    email_type_id = NotificationPreference.email_types[:notification_challenge_preregister]
    client = DIContainer.resolve("https_apps_client")
    client.email_send(email_type_id, { challengeId: id, scope: scope, name: name })
  end

  def validate_end_at
    return unless end_at_changed?
    return if end_at.blank?

    if start_at && end_at <= start_at
      errors.add(:end_at, "can't be before the challenge start time")
    end

    errors.add(:end_at, "can't be before the current time") if end_at <= DateTime.now
  end

  def validate_start_at
    return unless start_at_changed?
    return if start_at.blank?

    errors.add(:start_at, "can't be after the challenge end time") if end_at && end_at <= start_at
  end

  # Check if Chalenge can be opened?
  # Usage in a challenges cards on Challenges#create and Challenges#update
  # @return errors Can't open challenge unless space is accepted if challenge active and
  # space not accepted by leads
  def can_open?
    errors.add(:status, "Can't open challenge unless space is accepted") if active? && !space&.accepted?
  end

  def scope_should_be_valid
    return if scope == Scopes::SCOPE_PUBLIC || space_challenge?

    errors.add(:scope, "can be either 'public' or 'space-x")
  end
end
