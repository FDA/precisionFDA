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
#
#  Notes:
#  space_id is used primarily for Review Spaces where private areas of the Sponsor and
#           Reviewer sides refer to the host space
#           It is also used for Private Spaces which points back to itself

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

  STATES = [STATE_UNACTIVATED, STATE_ACTIVE, STATE_LOCKED, STATE_DELETED].freeze

  TYPES = %w(groups review verification private_type government administrator).freeze
  EXCLUSIVE_TYPES = %w(private_type government administrator).freeze

  SCOPE_PATTERN = /^space-(\d+)$/.freeze

  belongs_to :space
  belongs_to :sponsor_org, class_name: "Org"
  has_one :challenge

  has_and_belongs_to_many :space_memberships

  has_many :users, through: :space_memberships
  has_many :confidential_spaces, class_name: "Space"
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
                :guest_lead_dxuser,
                :sponsor_lead_dxuser

  scope :top_level, -> { where(space_id: nil) }
  scope :shared, -> { review.top_level }
  scope :confidential, -> { review.where.not(space_id: nil) }
  scope :reviewer, -> { review.where.not(host_dxorg: nil) }
  scope :sponsor, -> { review.where.not(guest_dxorg: nil) }
  scope :non_groups, -> { where.not(space_type: :groups) }
  scope :admin_spaces, -> { where(space_type: :administrator) }
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

  def workflow_series
    WorkflowSeries.accessible_by_space(self)
  end

  def latest_revision_workflows
    Workflow.where(id: workflow_series.pluck(:latest_revision_workflow_id))
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

  def confidential_sponsor_space
    confidential_spaces.sponsor.first
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

  # To distinct all Private spaces of private_type
  def exclusive?
    (space_id.present? && space_id == id) || EXCLUSIVE_TYPES.include?(space_type)
  end

  # Find a space, oposite to a given area of a current review space:
  #   if a current space is confidential and reviewer,
  #   then opposite space will be a sponsor one. And vice versa.
  # @param shared_space [Space object] shared space for self space
  # @return space [Space object] the opposite space
  def opposite_private_space(shared_space)
    if reviewer? && confidential?
      shared_space.confidential_spaces.sponsor.first
    else
      shared_space.confidential_spaces.reviewer.first
    end
  end

  def verified?
    return false if space_type != "verification"
    verified ? true : false
  end

  # this is always false for confidential review spaces
  # this is always true for exclusive private spaces
  def accepted?
    return true if exclusive?

    accepted_by?(host_lead_member) && accepted_by?(guest_lead_member)
  end

  # @param member [SpaceMembership object] - space member, host- or guest- lead.
  # @return [true, false] depends upon member acceptance of a space
  def accepted_by?(member)
    return false unless member
    return true if review? && confidential?

    if groups? || government? || administrator?
      return member.host? && host_project.present? ||
             member.guest? && guest_project.present?
    end

    # below are the checks for a shared review space
    member.host? && confidential_reviewer_space&.host_lead_member.present? ||
      member.guest? && confidential_sponsor_space&.guest_lead_member.present?
  end

  def uid
    "space-#{id}"
  end

  # @param update_space_params [Object] - consists of SpaceEditForm attributes
  # @param api [DNAnexusAPI]
  def leads_updates(update_space_params, api)
    return unless review?

    lead_invite_and_update(
      host_lead_dxuser,
      update_space_params.host_lead_dxuser,
      update_space_params.current_user,
      SpaceMembership::SIDE_HOST,
      api,
    )

    lead_invite_and_update(
      guest_lead_dxuser,
      update_space_params.sponsor_lead_dxuser,
      update_space_params.current_user,
      SpaceMembership::SIDE_GUEST,
      api,
    )
  end

  # @param space_lead_dxuser [String] dxuser of a current space lead - to be changed to Admin.
  # @param updated_lead_dxuser [String] dxuser of a new space lead - to be changed to Lead.
  # @param side [String] dxuser of a current space lead - to be changed to Admin.
  # @param api [DNAnexusAPI]
  def lead_invite_and_update(space_lead_dxuser, updated_lead_dxuser, current_user, side, api)
    return if space_lead_dxuser == updated_lead_dxuser

    membership = leads.find_by(side: side)

    return if user_member(updated_lead_dxuser).present?

    invite(membership, updated_lead_dxuser, current_user, api)
    update_role(updated_lead_dxuser, side, api)
  end

  def user_member(dxuser)
    # An active user's space memberships
    space_memberships.active.joins(:user).find_by(users: { dxuser: dxuser })
  end

  # @param space_lead_dxuser [String] dxuser of a current space lead - to be changed to Admin.
  # @param new_lead_dxuser [String] dxuser of a new space lead - to be changed to Lead.
  # @param api [DNAnexusAPI]
  def update_role(new_lead_dxuser, side, api)
    admin_member = leads.find_by(side: side)
    # An active user member changing to be Lead
    member = space_memberships.active.joins(:user).find_by(users: { dxuser: new_lead_dxuser })
    SpaceMembershipService::ToLead.call(api, self, member, admin_member)
  end

  def space_sponsor
    User.find_by(dxuser: sponsor_lead_dxuser)
  end

  def invite(membership, dxuser, current_user, api)
    space_invite_form = SpaceInviteForm.new(
      space: self,
      invitees_role: SpaceMembership::ROLE_ADMIN,
      space_id: id,
      invitees: dxuser,
      current_user: current_user,
    )

    return unless space_invite_form.valid?

    begin
      space_invite_form.invite(membership, api)
    rescue StandardError
      "An error has occurred during inviting"
    end
  end

  alias_method :scope, :uid

  # Space title for spaces list in actions modals
  def title
    if review?
      confidential? ? "#{name} (Private Review)" : "#{name} (Shared Review)"
    elsif verification?
      "#{name} (Verification)"
    elsif groups?
      "#{name} (Group)"
    elsif private_type?
      "#{name} (Private)"
    elsif government?
      "#{name} (Government)"
    else
      "#{name} (Administrator)"
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

  # def updatable_by?(user)
  #   active? && (user.review_space_admin? && reviewer? ||
  #     space_memberships.active.lead_or_admin.exists?(user: user))
  # end

  # Checks if user is able to update a space via Edit page.
  # @return [Boolean] Returns true if user is able to update a space, false otherwise.
  def updatable_by?(user)
    active? &&
      updatable_by_rsa?(user) || space_memberships.active.lead_or_admin.exists?(user: user)
  end

  # Checks if user is RSA and able to update a space via Edit page.
  # @return [Boolean] Returns true if user is RSA in review space and:
  #   does not member of a space (to be able to add himself) or
  #   is member of a space already, with 'lead' or 'admin' role.
  def updatable_by_rsa?(user)
    user.review_space_admin? && reviewer? &&
      (!space_memberships.active.exists?(user: user) ||
        space_memberships.active.lead_or_admin.exists?(user: user))
  end

  # Scopes of files that can be used to run an app.
  def accessible_scopes
    [uid, shared_space.try(:uid)].compact
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
end
