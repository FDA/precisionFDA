# Common Permissions for all objects, including spaces,
# which have separate internal permissions, placed in Space class.
module CommonPermissions
  extend ActiveSupport::Concern

  # Checks if object is accessible by the context user.
  # An object can be: app, workflow, job and space
  # analog of item.accessible_by?(@context) ||
  # @return [Boolean] Returns true if object is accessible by a user, false otherwise.
  def check_accessibility(current_user)
    accessible_by_user?(current_user) ||
      (try(:user).try(:dxuser) == CHALLENGE_BOT_DX_USER &&
        current_user.logged_in? &&
        current_user.is_challenge_evaluator?
      )
  end
end
