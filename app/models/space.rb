# == Schema Information
#
# Table name: spaces
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  description          :text(65535)
#  host_project         :string(255)
#  guest_project        :string(255)
#  host_dxorg           :string(255)
#  guest_dxorg          :string(255)
#  meta                 :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  space_id             :integer
#  state                :integer          default("unactivated"), not null
#  space_type           :integer          default("groups"), not null
#  verified             :boolean          default(FALSE), not null
#  sponsor_org_id       :integer
#  restrict_to_template :boolean          default(FALSE)
#  inactivity_notified  :boolean          default(FALSE)
#

class Space < ActiveRecord::Base
  paginates_per 25

  include Auditor
  include Scopes
  include CommonPermissions
  include TagsContainer

  STATE_UNACTIVATED = "unactivated".freeze
  STATE_ACTIVE = "active".freeze
  STATE_LOCKED = "locked".freeze
  STATE_DELETED = "deleted".freeze

  TYPES = %i(groups review verification).freeze
  STATES = [STATE_UNACTIVATED, STATE_ACTIVE, STATE_LOCKED, STATE_DELETED].freeze

  SCOPE_PATTERN = /^space-(\d+)$/.freeze

  belongs_to :space
  belongs_to :sponsor_org, class_name: "Org"
  has_one :challenge

  has_and_belongs_to_many :space_memberships

  has_many :users, through: :space_memberships
  has_many :confidential_spaces, class_name: "Space"
  has_many :tasks, dependent: :destroy
  has_many :space_events
  has_many :space_invitations

  has_many :comments, as: :commentable

  acts_as_commentable

  store :meta, accessors: [:cts], coder: JSON

  enum space_type: TYPES

  enum state: {
    STATE_UNACTIVATED => 0,
    STATE_ACTIVE => 1,
    STATE_LOCKED => 2,
    STATE_DELETED => 3,
  }

  alias_method :shared_space, :space

  attr_accessor :invitees,
                :invitees_role,
                :host_lead_dxuser,
                :guest_lead_dxuser

  scope :top_level, -> { where(space_id: nil) }
  scope :shared, -> { review.top_level }
  scope :confidential, -> { review.where.not(space_id: nil) }
  scope :reviewer, -> { review.where.not(host_dxorg: nil) }
  scope :sponsor, -> { review.where.not(guest_dxorg: nil) }
  scope :non_groups, -> { where.not(space_type: :groups) }
  scope :undeleted, -> { where.not(state: :deleted) }
  scope :restricted, -> { confidential.where(restrict_to_template: true) }
  scope :editable_by, lambda { |context|
    return none unless context.logged_in?

    query = active.where(
      space_memberships: {
        active: true,
        user: context.user,
        role: SpaceMembership::ROLES_CAN_EDIT,
      },
    ).where.not(id: restricted)

    query.joins(:space_memberships).distinct
  }

  scope :accessible_by, lambda { |user|
    where(
      state: [STATE_ACTIVE, STATE_UNACTIVATED],
      space_memberships: { user: user, active: true },
    ).or(
      locked.where(space_memberships: {
        user: user,
        active: true,
        side: SpaceMembership::SIDE_HOST,
      }),
    ).joins(:space_memberships).distinct
  }

  scope :visible_by, lambda { |user|
    where(
      state: [STATE_ACTIVE, STATE_UNACTIVATED, STATE_LOCKED],
      space_memberships: {
        user: user,
        active: true,
      },
    ).joins(:space_memberships).distinct
  }

  class << self
    def scope_id(scope)
      parsed = scope[SCOPE_PATTERN, 1]
      parsed ? parsed.to_i : nil
    end

    def valid_scope?(scope)
      (scope =~ SCOPE_PATTERN).present?
    end

    def from_scope(scope)
      raise NotASpaceError, "Invalid scope #{scope} in Space.from_scope" unless valid_scope?(scope)

      Space.find(scope_id(scope))
    end

    def spaces_members_ids(scopes)
      ids = []

      scopes.each do |scope|
        ids += Space.space_members_ids(scope)
      end

      ids.uniq
    end

    def space_members_ids(scope)
      space = Space.from_scope(scope)
      space.space_memberships.map(&:user_id)
    end
  end

  def apps
    App.accessible_by_space(self)
  end

  def app_series
    AppSeries.accessible_by_space(self)
  end

  def latest_revision_apps
    App.where(id: app_series.pluck(:latest_version_app_id))
  end

  def files
    UserFile.real_files.not_removing.accessible_by_space(self)
  end

  def folders
    Folder.accessible_by_space(self)
  end

  def assets
    Asset.accessible_by_space(self)
  end

  def nodes
    Node.accessible_by_space(self)
  end

  def notes
    Note.real_notes.accessible_by_space(self)
  end

  def jobs
    Job.accessible_by_space(self)
  end

  def comparisons
    Comparison.accessible_by_space(self)
  end

  def workflows
    Workflow.accessible_by_space(self)
  end

  def confidential_space(member)
    if member.host?
      confidential_reviewer_space
    else
      confidential_spaces.sponsor.first
    end
  end

  def confidential_reviewer_space
    confidential_spaces.reviewer.first
  end

  def reviewer?
    review? && host_dxorg.present?
  end

  def confidential?
    space_id.present?
  end

  def shared?
    review? && !confidential?
  end

  def verified?
    return false if space_type != "verification"
    verified ? true : false
  end

  def accepted?
    accepted_by_host = accepted_by?(host_lead_member)
    condition = verification?
    condition &&= (guest_lead_member.blank? || host_lead_member.user == guest_lead_member.user)
    return accepted_by_host if condition
    accepted_by_host && accepted_by?(guest_lead_member)
  end

  def accepted_by?(member)
    return false if member.blank?
    if member.host?
      return false if host_project.blank?
      return true unless review?
      return true if confidential?
      confidential_reviewer_space.host_lead_member.present?
    else
      return false if guest_project.blank?
      return true unless review?
      confidential_spaces.sponsor.first.guest_lead_member.present? unless confidential?
      guest_lead_member.present?
    end
  end

  def uid
    "space-#{id}"
  end

  alias_method :scope, :uid

  def title
    if review?
      confidential? ? "#{name}(Private)" : "#{name}(Shared)"
    elsif verification?
      "#{name}(Verification)"
    else
      "#{name}(Group)"
    end
  end

  def klass
    "space"
  end

  def project_dxid(member)
    member.host? ? host_project : guest_project
  end

  def set_project_dxid(member, value)
    self.host_project = value if member.host?
    self.guest_project = value if member.guest?
  end

  def org_dxid(member)
    member.host? ? host_dxorg : guest_dxorg
  end

  def set_org_dxid(member, value)
    self.host_dxorg = value if member.host?
    self.guest_dxorg = value if member.guest?
  end

  def opposite_org_dxid(member)
    member.host? ? guest_dxorg : host_dxorg
  end

  def project_for_user(user)
    member = space_memberships.find_by(user_id: user.id)

    member ||= SpaceMembership.new_by_admin(user) if user.review_space_admin? || user.challenge_bot?

    project_dxid(member)
  end

  # Determine, whether a user can run an app from current space.
  # @param project [String, nil] project id or nil.
  # @param user [User] current user.
  # @return [true, false] depends upon user'r role and project value
  def have_permission?(project, user)
    member = space_memberships.find_by(user: user)
    project.present? && member.lead_or_admin_or_contributor?
  end

  # Determines a space member by its user id.
  # @param id [Integer] user id.
  # @return [SpaceMembership] an Object with a user data, who is space member.
  def member(id)
    space_memberships.find_by(user_id: id)
  end

  # Determines whether a current space is confidential and if it's context member
  #   is a member of appropriate cooperative space also.
  # @param id [Integer] - user id.
  # @return [true, false] - depends upon a user is a cooperative space member.
  #   In case that current space is not confidential - returns false.
  def member_in_cooperative?(id)
    return false unless confidential?

    Space.find(space_id).member(id).present?
  end

  def describe_fields
    %w(title description state)
  end

  def to_param
    if name.nil?
      id.to_s
    else
      "#{id}-#{name.parameterize}"
    end
  end

  def leads
    space_memberships.lead
  end

  def host_lead
    host_lead_member&.user
  end

  def host_lead_member
    leads.host.first
  end

  # Returns dxuser of host_lead of the space.
  # @return [String] dxuser of the host lead of the space.
  def host_lead_dxuser
    host_lead_member.user.dxuser
  end

  def guest_lead
    guest_lead_member&.user
  end

  # Returns dxuser of guest_lead of the space.
  # @return [String] dxuser of the guest lead of the space.
  def guest_lead_dxuser
    guest_lead_member.user.dxuser
  end

  def guest_lead_member
    leads.guest.first
  end

  def authorized_users_for_apps
    [host_dxorg, guest_dxorg].compact
  end

  def editable_by?(user)
    active? &&
      space_memberships.active.exists?(
        user: user,
        role: SpaceMembership::ROLES_CAN_EDIT,
      ) &&
      !(restrict_to_template? && confidential?)
  end

  # Checks if user is able to update a space via Edit page.
  # @return [Boolean] Returns true if user is able to update a space, false otherwise.
  def updatable_by?(user)
    active? && (user.review_space_admin? && reviewer? ||
      space_memberships.active.lead_or_admin.exists?(user: user))
  end

  # Scopes of files that can be used to run an app.
  def accessible_scopes
    [uid, shared_space.try(:uid)].compact
  end

  # Scopes of content that can be moved to an space.
  def accessible_scopes_for_move
    [SCOPE_PRIVATE].freeze
  end

  # Determine, whether a space is accessible by a user.
  # @param context [Context] A user context.
  # @return [Boolean] Returns true if user has access to a space, false otherwise.
  def accessible_by?(context)
    return false unless context.logged_in?

    accessible_by_user?(context.user)
  end

  def visible_by?(user)
    user_membership = space_memberships.active.find_by(user: user)

    user_membership.present? && (unactivated? || active? || locked?)
  end

  # This method works as #accessible_by? but uses a user argument, not context.
  def accessible_by_user?(user)
    user_membership = space_memberships.active.find_by(user: user)

    user_membership.present? && (unactivated? || active? || locked? && user_membership.host?)
  end

  # Used in discuss only
  def search_content(content_type, query)
    case content_type
    when "Note"
      notes.where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |note| [note.id, note.title] }
    when "File"
      files.where("LOWER(name) LIKE LOWER(?)", "%#{query}%").where(parent_type: "User")
        .map { |file| [file.id, file.name] }
    when "Asset"
      assets.where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |asset| [asset.id, asset.name] }
    when "Comparison"
      comparisons.where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |comparison| [comparison.id, comparison.name] }
    when "App"
      apps.where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |app| [app.id, app.title] }
    when "Workflow"
      workflows.where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |workflow| [workflow.id, workflow.title] }
    when "Job"
      jobs.where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |job| [job.id, job.name] }
    else
      []
    end.map { |i, j| { id: i, name: j } }
  end

  def can_verify_space(context)
    (space_memberships.host.lead[0].user.dxuser == context.user.dxuser) && active?
  end

  def content_counters(user_id)
    tasks = self.tasks.where("user_id = :user_id or assignee_id = :user_id", user_id: user_id)
    open_tasks = tasks.open.count
    accepted_tasks = tasks.accepted_and_failed_deadline.count
    declined_tasks = tasks.declined.count
    completed_tasks = tasks.completed.count
    tasks = open_tasks + accepted_tasks + declined_tasks + completed_tasks

    feed = space_events.count

    {
      feed: feed,
      tasks: tasks,
      notes: notes.count,
      files: files.count,
      apps: apps.count,
      jobs: jobs.count,
      comparisons: comparisons.count,
      assets: assets.count,
      workflows: workflows.count,
      open_tasks: open_tasks,
      accepted_tasks: accepted_tasks,
      declined_tasks: declined_tasks,
      completed_tasks: completed_tasks,
    }
  end
end
