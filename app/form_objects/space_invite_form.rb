class SpaceInviteForm
  include ActiveModel::Model

  attr_accessor :invitees_role, :space, :space_id, :side
  attr_reader :invitees

  validates :invitees_role, presence: true, inclusion: { in: SpaceMembership.roles.keys }
  validate :validate_invitees,
           :validate_dxusers,
           :validate_users_sides,
           :check_emails_already_in_space,
           :check_dxusers_already_in_space

  # @param [SpaceMembership, #side, #user] membership
  def invite(membership, api)
    # rubocop:disable Style/SymbolProc
    return if invalid?

    existing_users.find_each do |user|
      SpaceService::Invite.call(api, space, membership, user, invitees_role)
    end

    existing_emails = existing_users.map { |user| user.email }

    # invite user from the outside of pFDA
    non_existing_emails.each do |email|
      SpaceService::InviteByEmail.call(space, email, membership, invitees_role)
    end
    # rubocop:enable Style/SymbolProc

    non_existing_emails + existing_emails
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
    errors.add(:invitees, "List of invitees is empty!") if invitees.values.flatten.blank?
  end

  # Validates a case to prevent a user from being added to both private areas of a review space
  # @param side [String] s side selected by a client, provided from UI
  # @return The validation result. Passed Ok or errors [Object] with a list of messages.
  def validate_users_sides
    all_members = space.space_memberships
    invalid_users = other_side_members = []
    members = all_members.where(side: selected_side) if side
    other_side_members = (all_members - members).pluck(:user_id) if members

    invitees[:dxuser].each do |dxuser|
      user = User.find_by(dxuser: dxuser)
      invalid_users << user.dxuser if user && other_side_members.include?(user.id)
    end
    invitees[:email].each do |email|
      user = User.find_by(email: email)
      invalid_users << user.email if user && other_side_members.include?(user.id)
    end

    return if invalid_users.empty?

    errors.add(
      :base,
      "The following user's could not be added because they exist in other space side already: " \
      "#{invalid_users.to_sentence}",
    )
  end

  # Determines a proper Side in case of selected one by a user.
  # @return selected_side [String] "host" or "guest"
  def selected_side
    if side == SpaceMembership::SIDE_HOST_ALIAS
      SpaceMembership::SIDE_HOST
    elsif side == SpaceMembership::SIDE_GUEST_ALIAS
      SpaceMembership::SIDE_GUEST
    end
  end

  def validate_dxusers
    invalid_dxusers = invitees[:dxuser] - User.pluck(:dxuser)

    return if invalid_dxusers.empty?

    errors.add(
      :base,
      "The following username's could not be added because they do not exist: " \
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
