# Space member serializer.
class SpaceMemberSerializer < ApplicationSerializer
  attribute :id
  attribute :dxuser
  attribute :user_url
  attribute :full_name, key: :name
  attribute :org
  attribute :accepted?, key: :is_accepted

  # Returns user's dxuser.
  # @return [String] User's dxuser.
  def dxuser
    object.user.dxuser
  end

  # Returns user's org name.
  # @return [String] User's org name.
  def org
    object.user.org&.name
  end

  # Returns full member's name.
  # @return [String] Full name.
  def full_name
    object.user.full_name
  end

  # Returns URL to user's profile page.
  # @return [String] URL to user's profile page.
  def user_url
    user_path(object.user.dxuser)
  end

  # Return status of space acceptance by member.
  # @return [true, false] Returns true if member accepted space, false otherwise.
  def accepted?
    object.spaces.first.accepted_by?(object)
  end

  # Returns member's id.
  # @return [Integer] User id.
  def id
    object.user.id
  end
end
