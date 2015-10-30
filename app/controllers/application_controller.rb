class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # Decode context
  before_action :decode_context

  # Require login
  before_action :require_login

  private

  def decode_context
    @context = Context.new(session[:user_id], session[:username], session[:token], session[:expiration], session[:org_id])
  end

  def save_session(user_id, username, token, expiration, org_id)
    session[:user_id] = user_id
    session[:username] = username
    session[:token] = token
    session[:expiration] = expiration
    session[:org_id] = org_id
  end

  def require_login
    unless @context.logged_in?
      redirect_to login_url
    end
  end
end
