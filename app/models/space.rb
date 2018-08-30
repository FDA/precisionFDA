class Space < ActiveRecord::Base
  include Auditor

  TYPES = %i(groups review)
  STATES = %i(unactivated active locked deleted)

  belongs_to :sponsor_org, { class_name: 'Org' }
  has_and_belongs_to_many :space_memberships
  has_many :users, { through: :space_memberships }
  has_many :confidential_spaces, class_name: 'Space'
  has_many :requests, class_name: 'SpaceRequest'
  belongs_to :space

  acts_as_commentable

  store :meta, accessors: [:cts], coder: JSON

  attr_accessor :invitees, :invitees_role

  alias_method :shared_space, :space

  enum space_type: TYPES
  enum state: STATES

  scope :top_level, -> { where(space_id: nil) }
  scope :shared, -> { review.top_level }
  scope :confidential, -> { review.where.not(space_id: nil) }
  scope :reviewer, -> { review.where.not(host_dxorg: nil) }
  scope :sponsor, -> { review.where.not(guest_dxorg: nil) }

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

  def accepted?
    if confidential?
      host_project.present? || guest_project.present?
    else
      host_project.present? && guest_project.present?
    end
  end

  def accepted_by?(member)
    if member.host?
      host_project.present?
    else
      guest_project.present?
    end
  end

  def uid
    "space-#{id}"
  end

  def title
    name
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
    project_dxid(
      space_memberships.find_by!(user_id: user.id)
    )
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

    raise unless context.user_id.present?

    return true if context.review_space_admin? && reviewer?

    space_memberships.active.lead_or_admin.exists?(user_id: context.user_id)
  end

  # Scopes of files that can be used to run an app.
  def accessible_scopes
    [uid, shared_space.try(:uid)].compact
  end

  def accessible_scopes_for_move
    ["private"]
  end

  def accessible_by?(context)
    return if context.guest?

    raise unless context.user_id.present?

    return true if context.review_space_admin? && reviewer?

    space_memberships.active.exists?(user_id: context.user_id)
  end

  def self.accessible_by(context)
    return if context.guest?

    raise unless context.user_id.present?

    if context.review_space_admin?
      joins(:space_memberships).where.any_of(
        { space_memberships: { active: true, user_id: context.user_id } },
        { id: self.reviewer },
      ).uniq
    else
      joins(:space_memberships).where(space_memberships: { active: true, user_id: context.user_id }).uniq
    end
  end
end
