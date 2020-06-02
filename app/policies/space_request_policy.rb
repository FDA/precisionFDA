# Responsible for space locking / removal.
module SpaceRequestPolicy
  extend self

  # Determines if space can be locked by user.
  # @param user [User] User that tries to lock space.
  # @param space [Space] Space that is tried to be locked.
  # @return [true, false] Returns true if space can be locked by user, false otherwise.
  def can_lock?(user, space)
    user.review_space_admin? && space.shared? && space.active?
  end

  # Determines if space can be unlocked by user.
  # @param user [User] User that tries to unlock space.
  # @param space [Space] Space that is tried to be unlocked.
  # @return [true, false] Returns true if space can be unlocked by user, false otherwise.
  def can_unlock?(user, space)
    user.review_space_admin? && space.shared? && space.locked?
  end

  alias_method :can_delete?, :can_unlock?
end
