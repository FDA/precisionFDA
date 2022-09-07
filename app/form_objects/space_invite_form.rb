class SpaceInviteForm
  include ActiveModel::Model

  attr_accessor :invitees_role, :space, :space_id, :side, :current_user
  attr_reader :invitees

  validates :invitees_role, presence: true, inclusion: { in: SpaceMembership.roles.keys }
  validate :validate_invitees,
           :validate_dxusers,
           :validate_space_admin,
           :validate_users_sides,
           :check_emails_already_in_space,
           :check_dxusers_already_in_space

  # @param membership [SpaceMembership] Inviter's membership object.
  # @param api [DNAnexusAPI] Inviter's api object.
  def invite(membership, api)
    # rubocop:todo Style/SymbolProc
    return if invalid?

    # Do not allow external users for now. See PFDA-2594
    unless non_existing_emails.empty?
      raise "Cannot invite users #{non_existing_emails.join(', ')} to this space. " \
        "Please ensure that they are registered with precisionFDA before inviting them."
    end

    existing_users.find_each do |user|
      SpaceService::Invite.call(api, space, membership, user, invitees_role)
    end

    existing_emails = existing_users.map { |user| user.email }

    # Disabling invitation of external user to a space until PFDA-2598 is fixed
    # non_existing_emails.each do |email|
    #   SpaceService::InviteByEmail.call(space, email, membership, invitees_role)
    # end
    # rubocop:enable Style/SymbolProc

    # non_existing_emails + existing_emails
    existing_emails
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

  # Validates if a current user is RSA. If yes, - then check, whether it is already a member.
  # If yes, then validation passed.
  # If no, the warning for RSA will display
  def validate_space_admin
    membership = space.space_memberships.active.find_by(user: current_user)

    return unless current_user.review_space_admin? && membership.blank? &&
                  !invitees[:dxuser].include?(current_user.dxuser)

    errors.add(
      :base,
      "You must add your own account #{current_user.dxuser} as admin before " \
        " you may add other members.",
    )
  end

  def validate_invitees
    errors.add(:invitees, "List of invitees is empty!") if invitees.values.flatten.blank?

    return unless space.government?

    # Check invitees for valid government emails
    # N.B. the invite form allows both email and dxuser entries
    invitees[:email].each do |email|
      next if User.government_email?(email)

      errors.add(
        :base,
        "Invitee #{email} is not a Government user",
      )
    end
    invitees[:dxuser].each do |dxuser|
      user = User.find_by(dxuser: dxuser)
      next if User.government_email?(user.email)

      errors.add(
        :base,
        "Invitee #{dxuser} is not a Government user",
      )
    end
  end

  # Validates a case to prevent a user from being added to both private and
  #   shared areas of a review space
  # @param side [String] a side selected by a client, provided from UI, when adding to shared area
  # @param space [Space object] current space
  # @return The validation result. Passed Ok or errors [Object] with a list of messages.
  def validate_users_sides
    members_ids_exist = []

    if space.review?
      if space.shared?
        all_members = space.space_memberships.active

        members = all_members.where(side: selected_side) if side
        members_ids_exist = (all_members - members).pluck(:user_id) if members
      else
        shared_space = space.shared_space
        space_members_ids = space.space_memberships.active.pluck(:user_id)
        opposite_private_space = space.opposite_private_space(shared_space)
        private_members_ids = opposite_private_space.space_memberships.active.pluck(:user_id)
        members_ids_exist = space_members_ids + private_members_ids if private_members_ids
      end
    end

    invalid_users = collect_invalid_users(members_ids_exist)

    return if invalid_users.empty?

    errors.add(
      :base,
      "The following users could not be added because they exist in other space side already: " \
        "#{invalid_users.to_sentence}",
    )
  end

  # Collects users ids, which are considered as invalid when a user is trying
  #   to add them to space.
  # @param members_ids_exist [Array of Integers] - array of users ids
  # @param invitees [String] - string, contains added user's emails or dxusers,
  #   separated by space or comma
  # @return invalid_users [Array of Integers] - array of users ids
  def collect_invalid_users(members_ids_exist)
    invalid_users = []

    invitees[:dxuser].each do |dxuser|
      user = User.find_by(dxuser: dxuser)
      invalid_users << user.dxuser if user && members_ids_exist.include?(user.id)
    end
    invitees[:email].each do |email|
      user = User.find_by(email: email)
      invalid_users << user.email if user && members_ids_exist.include?(user.id)
    end

    invalid_users
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
      "The following usernames could not be added because they do not exist: " \
      "#{invalid_dxusers.to_sentence}",
    )
  end

  def check_emails_already_in_space
    emails_in_space = space.
      space_memberships.active.joins(:user).
      where(users: { email: invitees[:email] }).pluck(:email)

    return if emails_in_space.blank?

    errors.add(
      :base,
      "The users with the following emails could not be invited because they " \
      "are participants already: #{emails_in_space.to_sentence}",
    )
  end

  def check_dxusers_already_in_space
    dxusers_in_space = space.
      space_memberships.active.joins(:user).
      where(users: { dxuser: invitees[:dxuser] }).pluck(:dxuser)

    return if dxusers_in_space.blank?

    errors.add(
      :base,
      "The users with the following usernames could not be invited because they " \
      "are participants already: #{dxusers_in_space.to_sentence}",
    )
  end
end
