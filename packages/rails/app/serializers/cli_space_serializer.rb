# Cli spaces serializer
class CliSpaceSerializer < ApplicationSerializer
  attributes(
    :id,
    :state,
    :title,
    :type,
    :role,
    :side,
    :protected,
  )

  attribute :space_type, key: :type
  attribute :rich_name, key: :title
  attribute :current_user_role, key: :role
  attribute :current_user_side, key: :side

  # Returns formatted created_at time.
  # @return [String] Formatted time.
  def created_at
    formatted_time(object.created_at)
  end

  def space_type
    return object.space_type if object.space_type != "private_type"

    "private"
  end

  # Returns formatted updated_at time.
  # @return [String] Formatted time.
  def updated_at
    formatted_time(object.updated_at)
  end

  def rich_name
    object.title
  end

  def current_user_side
    space_membership&.side
  end

  def current_user_role
    space_membership&.role
  end

  private

  # Returns current user space membership
  # @return [SpaceMembership] Space membership.
  def space_membership
    object.space_memberships.active.find_by(user: current_user)
  end
end
