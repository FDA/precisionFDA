# Checks if logged in user is admin.
# This constraint is used in routes by Sidekiq Web UI.
class AdminConstraint
  # Checks if logged in user is admin.
  # @param request [ActionDispatch::Request] Request.
  # @return [Boolean] Returns true if a user can administer the site, false otherwise.
  def matches?(request)
    context = Context.build(request.session)
    context.can_administer_site?
  end
end
