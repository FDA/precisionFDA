# Member serializer.
class SpaceMembershipSerializer < ApplicationSerializer
  attributes(
    :id,
    :user_name,
    :title,
    :active,
    :role,
    :side,
    :domain,
    :created_at,
    :links,
    :to_roles,
    :shared_membership_id,
  )

  def active
    if object.active?
      return "Active" if object.user.user_state == "enabled"
      return "Account deactivated" if object.user.user_state == "deactivated"
      return "Account locked" if object.user.user_state == "locked"
    end
    "Inactive"
  end

  # Returns a dxuser of a member user.
  # @return [String] dxuser.
  def user_name
    object.user.dxuser
  end

  # Returns a full_name of a member user.
  # @return [String] full_name.
  def title
    object.user.full_name
  end

  # Extract the email domain without the extension from the email, empty string if something's missing
  def domain
    email = object.user.email
    return "" if email.nil? || email.exclude?("@") || email.exclude?(".")

    email.split("@").last.split(".").first
  end

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    return unless current_user

    {}.tap do |links|
      links[:user] = user_path(object.user.dxuser)
    end
  end

  def to_roles
    return [] unless current_membership

    all_roles.select do |role|
      SpaceMembershipPolicy.can_change_role?(
        space,
        current_membership,
        object,
        role,
      )
    end
  end

  def shared_membership_id
    return object.id if !space.review? || space.shared?

    shared_membership = Space.find_by(id: space.space_id).space_memberships.find_by(user: object.user)
    shared_membership&.id
  end

  private

  def space
    @space ||= object.spaces.first
  end

  def current_membership
    @current_membership ||= begin
      current_user && space.space_memberships.active.find_by(user: current_user)
    end
  end

  def all_roles
    SpaceMembership::ROLES + [SpaceMembership::ENABLE, SpaceMembership::DISABLE]
  end
end
