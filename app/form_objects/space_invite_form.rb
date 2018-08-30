class SpaceInviteForm
  include ActiveModel::Model

  attr_accessor(
    :invitees,
    :invitees_role
  )

  validates :invitees, :invitees_role, presence: true
  validates :invitees_role, inclusion: { in: SpaceMembership.roles.keys }
  validate :validate_invitees

  def invitees=(value)
    @invitees = value.split(',').map(&:strip)
  end

  # @param [SpaceMembership, #side, #user] admin
  def invite(context, space, admin)
    return if invalid?

    api = context.review_space_admin? ? DNAnexusAPI.for_admin : context.api

    valid_invitees.each do |user|
      SpaceService::Invite.call(api, space, admin, user, invitees_role)
    end
  end

  private

  def invalid_invitees
    invitees - valid_invitees.pluck(:dxuser)
  end

  def valid_invitees
    @valid_invitees ||= User.where(dxuser: invitees)
  end

  def validate_invitees
    return unless invitees

    if invalid_invitees.any?
      errors.add(:invitees, "The follow username's could not be invited because they do not exist: #{invalid_invitees.to_sentence}")
    end
  end

end
