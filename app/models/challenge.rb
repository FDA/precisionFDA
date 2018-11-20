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
  include Auditor

  STATUS_SETUP =    "setup"
  STATUS_OPEN =     "open"
  STATUS_PAUSED =   "paused"
  STATUS_ARCHIVED = "archived"
  STATUS_RESULT_ANNOUNCED = "result_announced"

  belongs_to :app_owner, { class_name: 'User', foreign_key: 'app_owner_id' }
  belongs_to :app, { class_name: 'App', foreign_key: 'app_id' }

  has_many :submissions, dependent: :destroy
  has_many :jobs, through: :submissions
  has_many :challenge_resources, dependent: :destroy

  acts_as_followable

  store :meta, accessors: [:regions], coder: JSON

  scope :automated, -> { where(automated: true) }
  scope :archived, -> { where(status: STATUS_ARCHIVED) }
  scope :not_archived, -> { where.not(status: STATUS_ARCHIVED) }

  delegate :setup?, :active?, :coming_soon?, :paused?, :closed?, :archived?, :result_announced?, to: :state

  validates :start_at, :end_at, presence: true
  validates :title, length: { maximum: 150 }
  validates :description, length: { maximum: 50000 }

  validates :status, inclusion: { :in => ->(challenge) { challenge.available_statuses } }
  validates :meta, meta: true
  validates :app_id,
            presence: true,
            if: ->(challenge) { !challenge.status_setup? }
  validate :validate_end_at
  validate :validate_start_at

  def self.available_statuses
    [STATUS_SETUP, STATUS_OPEN, STATUS_PAUSED, STATUS_ARCHIVED, STATUS_RESULT_ANNOUNCED]
  end

  def self.add_app_dev(context, challenge_id, app_id)
    result = false
    api = DNAnexusAPI.new(context.token)

    Challenge.transaction do
      app = App.find_by(id: app_id)
      user = User.challenge_bot
      api.call(app.dxid, "addDevelopers", {developers: [user.dxid]})
      challenge = Challenge.find_by!(id: challenge_id)
      challenge.update!(app_id: app_id)
      result = true
    end

    return result
  end

  def self.featured(context)
    if context.challenge_admin?
      not_archived
    else
      where.not(status: [STATUS_SETUP, STATUS_ARCHIVED])
    end
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
    "#{name.parameterize}"
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
    update_attributes!(status: STATUS_RESULT_ANNOUNCED)
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

  def can_assign_specific_app?(context, checked_app)
    return false unless context.logged_in?
    return false if over?

    return unless [STATUS_PAUSED, STATUS_SETUP].include?(status)

    return false unless app_owner == context.user
    return true if app_id.blank?
    return false if app_id == checked_app.id
    return true if submissions.empty?

    app.input_spec == checked_app.input_spec
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
    return unless card_image_id.present?

    card_image = UserFile.find_by_uid!(card_image_id)
    update_attributes(
      card_image_url: DNAnexusAPI.for_challenge_bot.generate_permanent_link(card_image)
    )
  end

  private

  def validate_end_at
    return unless end_at_changed?
    return if end_at.blank?

    if start_at && end_at <= start_at
      errors.add(:end_at, "can't be before the challenge start time")
    end

    if end_at <= DateTime.now
      errors.add(:end_at, "can't be before the current time")
    end
  end

  def validate_start_at
    return unless start_at_changed?
    return if start_at.blank?

    if start_at <= DateTime.now
      errors.add(:start_at, "can't be before the current time")
    end

    if end_at && end_at <= start_at
      errors.add(:start_at, "can't be after the challenge end time")
    end
  end

end
