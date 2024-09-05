class UserPolicy

  class << self

    # Visibility of the spaces' button
    def can_see_spaces?(context)
      return false unless context.logged_in?
      context.user.can_see_spaces?
    end

    def can_see_gsrs?(context)
      return false unless context.logged_in?

      !context.user.guest?
    end

    def access_notification_preference?(user)
      user.spaces.any?
    end

  end
end
