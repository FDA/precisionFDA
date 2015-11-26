class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # Decode context
  before_action :decode_context

  # Require login
  before_action :require_login

  helper_method :pathify

  private

  def decode_context
    @context = Context.new(session[:user_id], session[:username], session[:token], session[:expiration], session[:org_id])
  end

  def save_session(user_id, username, token, expiration, org_id)
    reset_session
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

  def require_api_login
    if !@context.logged_in?
      auth = request.headers["Authorization"]
      if auth.is_a?(String) && auth =~ /^Key (.+)$/
        key = $1
        begin
          decrypted = JSON.parse(rails_encryptor.decrypt_and_verify(key))
          if decrypted.is_a?(Hash) && decrypted["context"].is_a?(Hash)
            fields = [:user_id, :username, :token, :expiration, :org_id].map { |f| decrypted["context"][f.to_s] }
            @context = Context.new(*fields)
          end
        rescue
        end
      end
    end

    if !@context.logged_in?
      render status: :unauthorized, json: {failure: "Authentication failure"}
    end
  end

  def rails_encryptor
    config = Rails.application.config
    key_generator = ActiveSupport::KeyGenerator.new(Rails.application.secrets.secret_key_base, iterations: 1000)
    secret = key_generator.generate_key(config.action_dispatch.encrypted_cookie_salt)
    sign_secret = key_generator.generate_key(config.action_dispatch.encrypted_signed_cookie_salt)
    encryptor = ActiveSupport::MessageEncryptor.new(secret, sign_secret)
  end

  def pathify(item)
    case item.klass
    when "file"
      file_path(item.dxid)
    when "note"
      note_path(item)
    when "app"
      app_path(item.dxid)
    when "job"
      job_path(item.dxid)
    when "asset"
      asset_path(item.dxid)
    when "comparison"
      comparison_path(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end
end
