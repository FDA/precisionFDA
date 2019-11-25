# Check if logged in user is admin.
# This constraint is used in routes by Sidekiq Web UI.
class AdminConstraint
  def matches?(request)
    context = Context.build(request.session)
    context.can_administer_site?
  end
end
