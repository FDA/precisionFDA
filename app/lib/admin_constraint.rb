# Checks if logged in user is admin.
# This constraint is used in routes by Sidekiq Web UI.
class AdminConstraint
  def matches?(request)
    session = request.session

    context = Context.new(
      session[:user_id],
      session[:username],
      session[:token],
      session[:expiration],
      session[:org_id],
    )

    context.can_administer_site?
  end
end
