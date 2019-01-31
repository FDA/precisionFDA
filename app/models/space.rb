# TODO Items can be moved from private submitter/reviewer workspaces to a shared space.
class Space < ActiveRecord::Base
  include Auditor

  TYPES = %i(groups review verification)
  STATES = %i(unactivated active locked deleted)

  belongs_to :sponsor_org, { class_name: 'Org' }
  has_and_belongs_to_many :space_memberships
  has_many :users, { through: :space_memberships }
  has_many :confidential_spaces, class_name: 'Space'
  belongs_to :space
  has_many :tasks, dependent: :destroy
  has_many :space_events

  belongs_to :space_template

  acts_as_commentable

  store :meta, accessors: [:cts], coder: JSON

  alias_method :shared_space, :space

  attr_accessor :invitees, :invitees_role

  attr_accessor :host_lead_dxuser, :guest_lead_dxuser, :invitees, :invitees_role

  enum space_type: TYPES
  enum state: STATES

  scope :top_level, -> { where(space_id: nil) }
  scope :shared, -> { review.top_level }
  scope :confidential, -> { review.where.not(space_id: nil) }
  scope :reviewer, -> { review.where.not(host_dxorg: nil) }
  scope :sponsor, -> { review.where.not(guest_dxorg: nil) }
  scope :all_verified, -> { where(verified: true) }

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
    return false if space_type != 'verification'
    verified ? true : false
  end

  def accepted?
    accepted_by?(host_lead_member) && accepted_by?(guest_lead_member)
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
      confidential_spaces.sponsor.first.guest_lead_member.present?
    end
  end

  def uid
    "space-#{id}"
  end

  def title
    return name unless review?
    confidential? ? "#{name}(Confidential)" : "#{name}(Cooperative)"
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

  def project_for_user!(user)
    member = space_memberships.find_by(user_id: user.id)

    if user.review_space_admin?
      member ||= SpaceMembership.new_by_admin(user)
    end

    project_dxid(member)
  end

  def describe_fields
    ["title", "description", "state"]
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

  def rename(new_name, context)
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

  def guest_lead
    guest_lead_member.user
  end

  def guest_lead_member
    leads.guest.first
  end

  def authorized_users_for_apps
    [host_dxorg, guest_dxorg].compact
  end

  def self.from_scope(scope)
    if scope =~ /^space-(\d+)$/
      return Space.find_by!(id: $1.to_i)
    else
      raise "Invalid scope #{scope} in Space.from_scope"
    end
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

  def accessible_by?(context)
    return if context.guest?

    raise unless context.user_id.present?

    return true if context.review_space_admin? && reviewer?
    return true if context.review_space_admin? && verified?

    space_memberships.active.exists?(user_id: context.user_id)
  end

  def self.accessible_by(context)
    return if context.guest?

    raise unless context.user_id.present?

    queries = [].tap do |queries|
      queries.push({ space_memberships: { active: true, user_id: context.user_id } })
      if context.review_space_admin?
        queries.push({ id: self.reviewer.shared })
        queries.push({ id: self.reviewer.confidential.active })
        queries.push({ id: self.verification})
      end
      queries.push({ id: self.groups }) if context.can_administer_site?
    end

    joins(:space_memberships).where.any_of(*queries).uniq
  end

  def search_content(content_type, query)
    case content_type
    when "Note"
      Note.real_notes.accessible_by_space(self).where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |note| [note.id, note.title]}
    when "File"
      UserFile.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%").where(parent_type: "User")
        .map { |file| [file.id, file.name]}
    when "Asset"
      Asset.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |asset| [asset.id, asset.name]}
    when "Comparison"
      Comparison.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |comparison| [comparison.id, comparison.name]}
    when "App"
      App.accessible_by_space(self).where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |app| [app.id, app.title]}
    when "Workflow"
      Workflow.accessible_by_space(self).where("LOWER(title) LIKE LOWER(?)", "%#{query}%")
        .map { |workflow| [workflow.id, workflow.title]}
    when "Job"
      Job.accessible_by_space(self).where("LOWER(name) LIKE LOWER(?)", "%#{query}%")
        .map { |job| [job.id, job.name]}
    else
      []
    end.map { |i, j| { id: i, name: j } }
  end
  def can_verify_space(context)
    (space_memberships.host.lead[0].user.dxuser == context.user.dxuser) && active?
  end

  def content_counters(user_id)
    notes = Note.real_notes.accessible_by_space(self).count
    files = UserFile.real_files.accessible_by_space(self).count
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

    feed = self.space_events.count

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
