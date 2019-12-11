class SpaceInviteForm
  include ActiveModel::Model

  attr_accessor :invitees_role, :space
  attr_reader :invitees

  validates :invitees_role, presence: true, inclusion: { in: SpaceMembership.roles.keys }
  validate :validate_invitees,
           :validate_dxusers,
           :check_emails_already_in_space,
           :check_dxusers_already_in_space

  # @param [SpaceMembership, #side, #user] membership
  def invite(membership, api)
    return if invalid?

    existing_users.find_each do |user|
      SpaceService::Invite.call(api, space, membership, user, invitees_role)
    end

    # invite user from the outside of pFDA
    non_existing_emails.each do |email|
      SpaceService::InviteByEmail.call(space, email, membership, invitees_role)
    end

    non_existing_emails
  end

  # @param [String] value Comma-separated list of invitees (emails or dxusers)
  def invitees=(value)
    splitted = value.split(/\s*,\s*/)

    @invitees = splitted.each_with_object(email: [], dxuser: []) do |invitee, memo|
      key = User.validate_email(invitee) ? :email : :dxuser
      memo[key] << invitee
    end
  end

  private

  def existing_users
    User.where(dxuser: invitees[:dxuser]).or(
      User.where(email: invitees[:email]),
    )
  end

  def non_existing_emails
    invitees[:email] - existing_users.pluck(:email)
  end

  def validate_invitees
    errors.add(:invitees, "list is empty!") if invitees.values.flatten.blank?
  end

  def validate_dxusers
    invalid_dxusers = invitees[:dxuser] - User.pluck(:dxuser)

    return if invalid_dxusers.empty?

    errors.add(
      :base,
      "The following username's could not be invited because they do not exist: " \
      "#{invalid_dxusers.to_sentence}",
    )
  end

  def check_emails_already_in_space
    emails_in_space = (space.users & User.where(email: invitees[:email])).pluck(:email)

    return if emails_in_space.empty?

    errors.add(
      :base,
      "The users with the following emails could not be invited because they " \
      "are participants already: #{emails_in_space.to_sentence}",
    )
  end

  def check_dxusers_already_in_space
    dxusers_in_space = (space.users & User.where(dxuser: invitees[:dxuser])).pluck(:dxuser)

    return if dxusers_in_space.empty?

    errors.add(
      :base,
      "The users with the following usernames could not be invited because they " \
      "are participants already: #{dxusers_in_space.to_sentence}",
    )
  end
end
