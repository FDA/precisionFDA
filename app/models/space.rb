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
#  space_template_id    :integer
#  restrict_to_template :boolean          default(FALSE)
#  inactivity_notified  :boolean          default(FALSE)
#

class Space < ActiveRecord::Base
  # TODO: Items can be moved from private submitter/reviewer workspaces to a shared space.
  include Auditor

  TYPES = %i(groups review verification)
  STATES = %i(unactivated active locked deleted)

  belongs_to :space
  belongs_to :space_template
  belongs_to :sponsor_org, class_name: "Org"
  has_one :challenge

  has_and_belongs_to_many :space_memberships

  has_many :users, through: :space_memberships
  has_many :confidential_spaces, class_name: "Space"
  has_many :tasks, dependent: :destroy
  has_many :space_events
  has_many :space_invitations

  acts_as_commentable

  store :meta, accessors: [:cts], coder: JSON

  enum space_type: TYPES
  enum state: STATES

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
  scope :all_verified, -> { where(verified: true) }
  scope :non_groups, -> { where.not(space_type: :groups) }
  scope :undeleted, -> { where.not(state: :deleted) }

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

  def title
    if review?
      confidential? ? "#{name}(Confidential)" : "#{name}(Cooperative)"
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
    if member.host?
      host_project
    else
      guest_project
    end
  end

  def set_project_dxid(member, value)
    self.host_project = value if member.host?
    self.guest_project = value if member.guest?
  end

  def org_dxid(member)
    if member.host?
      host_dxorg
    else
      guest_dxorg
    end
  end

  def set_org_dxid(member, value)
    self.host_dxorg = value if member.host?
    self.guest_dxorg = value if member.guest?
  end

  def opposite_org_dxid(member)
    if member.host?
      guest_dxorg
    else
      host_dxorg
    end
  end

  def project_for_user(user)
    member = space_memberships.find_by(user_id: user.id)

    if user.review_space_admin?
      member ||= SpaceMembership.new_by_admin(user)
    end

    project_dxid(member)
  end

  # Determine, whether a user can run an app from current space.
  # @param project [String or nil] - project id or nil.
  # @param user [User] - current user.
  # @return [true or false] - depends upon user'r role and project value
  def have_permission?(project, user)
    member = space_memberships.find_by(user: user)
    project.present? && member.lead_or_admin_or_contributor?
  end

  # Determines a space member by its user id.
  # @param id [Integer] - user id.
  # @return [SpaceMembership] - an Object with a user data, who is space member.
  def member(id)
    space_memberships.find_by(user_id: id)
  end

  # Determines whether a current space is confidential and if it's context member
  #   is a member of appropriate cooperative space also.
  # @param id [Integer] - user id.
  # @return [true or false] - depends upon a user is a cooperative space member.
  #   In case that current space is not confidential - returns false.
  def member_in_cooperative?(id)
    return false unless self.confidential?

    Space.find(self.space_id).member(id).present?
  end

  # Determine, whether a space provide a contributor (non-viewer) permission for user actions.
  # @param context [Context] - a context user
  # @return [true or false] - depends upon user'r role, context accessibility to space and
  #   possibility to move space content.
  def contributor_permission(context)
    accessible_by?(context) &&
      SpaceMembershipPolicy.can_move_content?(self, member(context.user.id))
  end

  def describe_fields
    %w(title description state)
  end

  def created_at_in_ny
    created_at.in_time_zone("America/New_York")
  end

  def to_param
    if name.nil?
      id.to_s
    else
      "#{id}-#{name.parameterize}"
    end
  end

  def rename(new_name, _context)
    update_attributes(name: new_name)
  end

  def leads
    space_memberships.lead
  end

  def host_lead
    host_lead_member.user
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
    guest_lead_member.user
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

  def self.from_scope(scope)
    if scope =~ /^space-(\d+)$/
      Space.find_by!(id: Regexp.last_match(1).to_i)
    else
      raise NotASpaceError, "Invalid scope #{scope} in Space.from_scope"
    end
  end

  def self.spaces_members_ids(scopes)
    ids = []
    scopes.each do |scope|
      ids=ids + Space.space_members_ids(scope)
    end
    ids.uniq
  end

  def self.space_members_ids(scope)
    space = Space.from_scope(scope)
    space.space_memberships.map(&:user_id)
  end

  def editable_by?(context)
    return if context.guest?
    return if verified?
    raise unless context.user_id.present?

    return true if context.review_space_admin? && reviewer?

    space_memberships.active.lead_or_admin.exists?(user_id: context.user_id)
  end

  # Scopes of files that can be used to run an app.
  def accessible_scopes
    [uid, shared_space.try(:uid)].compact
  end

  # Scopes of content that can be moved to an space.
  def accessible_scopes_for_move
    ["private"]
  end

  # Determine, whether an object is accessible by context user in space.
  #   A space provides a contributor (non-viewer) permission for user actions,
  #   for ex.: to publish to space, to delete a not owned file, etc.
  # @param context [Context] - project id or nil.
  # @return [true or false] - depends upon user'r role and project value
  def accessible_by?(context)
    return if context.guest?
    raise if context.user_id.blank?

    return true if context.review_space_admin? && reviewer?
    return true if context.review_space_admin? && verified?

    space_memberships.active.exists?(user_id: context.user_id)
  end

  def self.accessible_by(context)
    return if context.guest?

    raise unless context.user_id.present?

    query = where(space_memberships: { active: true, user_id: context.user_id })

    if context.review_space_admin?
      query = query.or(where(id: reviewer.shared)).
        or(where(id: reviewer.confidential.active)).
        or(where(id: verification))
    end

    query = query.or(where(id: groups)) if context.can_administer_site?

    query.joins(:space_memberships).distinct
  end

  def search_content(content_type, query)
    case content_type
    when "Note"
      Note.real_notes.accessible_by_space(self).where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |note| [note.id, note.title] }
    when "File"
      UserFile.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%").where(parent_type: "User")
        .map { |file| [file.id, file.name] }
    when "Asset"
      Asset.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |asset| [asset.id, asset.name] }
    when "Comparison"
      Comparison.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |comparison| [comparison.id, comparison.name] }
    when "App"
      App.accessible_by_space(self).where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |app| [app.id, app.title] }
    when "Workflow"
      Workflow.accessible_by_space(self).where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |workflow| [workflow.id, workflow.title] }
    when "Job"
      Job.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |job| [job.id, job.name] }
    else
      []
    end.map { |i, j| { id: i, name: j } }
  end

  def can_verify_space(context)
    (space_memberships.host.lead[0].user.dxuser == context.user.dxuser) && active?
  end

  def content_counters(user_id)
    notes = Note.real_notes.accessible_by_space(self).count
    files = UserFile.real_files.not_removing.accessible_by_space(self).count
    apps = App.accessible_by_space(self).count
    jobs = Job.accessible_by_space(self).count
    comparisons = Comparison.accessible_by_space(self).count
    assets = Asset.accessible_by_space(self).count

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
      notes: notes,
      files: files,
      apps: apps,
      jobs: jobs,
      comparisons: comparisons,
      assets: assets,
      workflows: Workflow.accessible_by_space(self).count,
      open_tasks: open_tasks,
      accepted_tasks: accepted_tasks,
      declined_tasks: declined_tasks,
      completed_tasks: completed_tasks,
    }
  end
end
