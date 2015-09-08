require 'context'

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
    @context = Context.new(session[:username], session[:token], session[:expiration])
  end

  def save_session(username, token, expiration)
    session[:username] = username
    session[:token] = token
    session[:expiration] = expiration
  end

  def require_login
    unless @context.logged_in?
      redirect_to login_url
    end
  end
end
