class UserPolicy

  class << self

    # Visibility of the spaces' button
    def can_see_spaces?(context)
      return false unless context.logged_in?
      return true if context.user.review_space_admin?
      return true if context.user.can_administer_site?

      context.user.space_memberships.active.count > 0
    end

    def access_notification_preference?(user)
      user.spaces.review.any?
    end

  end
end
