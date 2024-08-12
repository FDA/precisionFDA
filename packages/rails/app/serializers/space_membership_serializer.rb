# Member serializer.
class SpaceMembershipSerializer < ApplicationSerializer
  attributes(
    :id,
    :user_name,
    :title,
    :active,
    :role,
    :side,
    :org,
    :domain,
    :created_at,
    :links,
    :to_roles,
  )

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

  # Returns a space member user org.
  # @return [String] handle.
  def org
    object.user.org&.handle
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
