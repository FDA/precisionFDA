class UserPolicy

  class << self

    def can_see_spaces?(context)
      return false unless context.logged_in?
      return true if context.user.review_space_admin?

      context.user.space_memberships.active.count > 0
    end

  end
end
