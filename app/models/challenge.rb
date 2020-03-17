# == Schema Information
#
# Table name: challenges
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  admin_id        :integer
#  app_owner_id    :integer
#  app_id          :integer
#  description     :text(65535)
#  meta            :text(65535)
#  start_at        :datetime
#  end_at          :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  status          :string(255)
#  automated       :boolean          default(TRUE)
#  card_image_url  :string(255)
#  card_image_id   :string(255)
#  specified_order :integer
#  space_id        :integer
#

class Challenge < ApplicationRecord
  include Auditor

  STATUS_SETUP =    "setup".freeze
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

  attr_accessor :replacement_id
  store :meta, accessors: [:regions], coder: JSON

  scope :automated, -> { where(automated: true) }
  scope :archived, -> { where(status: STATUS_ARCHIVED) }
  scope :not_archived, -> { where.not(status: STATUS_ARCHIVED) }

  delegate :setup?, :active?, :coming_soon?, :paused?, :closed?, :archived?, :result_announced?, to: :state

  validates :start_at, :end_at, presence: true
  validates :title, length: { maximum: 150 }
  validates :description, length: { maximum: 50_000 }

  validates :status, inclusion: { in: ->(challenge) { challenge.available_statuses } }
  validates :meta, meta: true
  validates :app_id,
            presence: true,
            unless: :status_setup?
  validate :validate_end_at
  validate :validate_start_at
  validate :can_open?
  attr_accessor :host_lead_dxuser, :guest_lead_dxuser

  def self.available_statuses
    [STATUS_SETUP, STATUS_OPEN, STATUS_PAUSED, STATUS_ARCHIVED, STATUS_RESULT_ANNOUNCED]
  end

  def self.add_app_dev(context, challenge_id, app_id)
    result = false
    api = DNAnexusAPI.new(context.token)

    Challenge.transaction do
      app = App.find_by(id: app_id)
      user = User.challenge_bot
      api.call(app.dxid, "addDevelopers", developers: [user.dxid])
      challenge = Challenge.find_by!(id: challenge_id)
      challenge.update!(app_id: app_id)
      result = true
    end

    result
  end

  def self.featured(context)
    challenges = context.challenge_admin? ? not_archived : where.not(status: [STATUS_SETUP, STATUS_ARCHIVED])
    challenges.order(specified_order: "desc")
  end

  def self.app_owned_by(context)
    return none unless context.logged_in?

    where(app_owner_id: context.user_id).where("end_at > ?", DateTime.now)
  end

  def self.current
    not_archived.last
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
    context.logged_in?
  end

  def editable_by?(context)
    context.challenge_admin?
  end

  def status_setup?
    status == STATUS_SETUP
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
    return [STATUS_SETUP] if new_record?
    return [STATUS_RESULT_ANNOUNCED, STATUS_ARCHIVED, status].uniq if over?
    return [STATUS_OPEN, STATUS_PAUSED, status].uniq if started?

    [STATUS_OPEN, STATUS_PAUSED, status].uniq
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
       ![STATUS_PAUSED, STATUS_SETUP].include?(status) ||
       app_owner != context.user ||
       app_id == checked_app.id
      false
    else
      true
    end
  end

  def is_viewable?(context)
    !setup? || context.challenge_admin?
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
      space_type: "groups",
    )

    space = SpaceService::Create.call(space_form, api: context.api, user: context.user)
    membership = space.space_memberships.find_by(user_id: space.host_lead.id)

    SpaceService::Invite.call(
      context.api,
      space,
      membership,
      User.find_by(dxuser: CHALLENGE_BOT_DX_USER),
      SpaceMembership::ROLE_ADMIN,
    )

    update!(space: space)
  end

  private

  # Add specified_order to challenge equal to it's id.
  # Usage in a challenges create on Challenges#new
  def initialize_order
    self.specified_order = id
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
end
