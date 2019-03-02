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

    def can_delete?(user, space)
       return false unless space.shared?
       return false unless space.locked?
       user.review_space_admin?
    end
  end
end
