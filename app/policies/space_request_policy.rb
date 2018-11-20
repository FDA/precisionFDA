class SpaceRequestPolicy
  class << self

    def can_lock?(user, space)
      return false unless space.shared?
      user.review_space_admin? && space.active?
    end

    def can_unlock?(user, space)
      return false unless space.shared?
      user.review_space_admin? && space.locked?
    end
  end
end
