class ApplicationController < ActionController::Base
  # Secure headers
  SecureHeaders::Configuration.default do |config|
    config.hsts = "max-age=#{20.years.to_i}"
    config.x_frame_options = "DENY"
    config.x_content_type_options = "nosniff"
    config.x_xss_protection = "1; mode=block"
    config.x_download_options = "noopen"
    config.x_permitted_cross_domain_policies = "none"
    config.csp = {
      base_uri: %w('self'),
      block_all_mixed_content: true, # see [http://www.w3.org/TR/mixed-content/](http://www.w3.org/TR/mixed-content/)
      child_src: %w('self' https://www.youtube.com blob:),
      connect_src: %w('self' https://s3.amazonaws.com https://stagingdl.dnanex.us https://dl.dnanex.us https://api.dnanexus.com),
      default_src: %w(https: 'self'),
      font_src: %w('self' https://fonts.gstatic.com https://cdnjs.cloudflare.com),
      form_action: %w('self' https://stagingdl.dnanex.us https://dl.dnanex.us),
      frame_ancestors: %w('none'),
      frame_src: %w(https://www.youtube.com),
      img_src: %w(* data:),
      media_src: %w('self'),
      object_src: %w('self'),
      plugin_types: %w(application/x-shockwave-flash),
      script_src: %w('self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://cdnjs.cloudflare.com https://www.youtube.com https://s.ytimg.com https://dnanexus.github.io),
      style_src: %w('self' 'unsafe-inline' https://fonts.googleapis.com https://dnanexus.github.io https://cdnjs.cloudflare.com),
      report_only: true,
      report_uri: %w(https://report-uri.io/report/dc95b34a080e9c95bbce7c3e6aed6234)
    }

  end

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # Decode context
  before_action :decode_context

  # Require login
  before_action :require_login

  helper_method :pathify

  rescue_from ActionView::MissingTemplate, with: :missing_template

  private

  def missing_template
    render nothing: true, status: 406
  end

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

  def require_login_or_guest
    unless @context.logged_in_or_guest?
      redirect_to login_url
    end
  end

  def require_api_login_or_guest
    if @context.logged_in_or_guest?
      if verified_request?
        return
      end
    else
      process_authorization_header
      if @context.logged_in?
        return
      end
    end
    render status: :unauthorized, json: {failure: "Authentication failure"}
  end

  def require_api_login
    if @context.logged_in?
      if verified_request?
        return
      end
    else
      process_authorization_header
      if @context.logged_in?
        return
      end
    end
    render status: :unauthorized, json: {failure: "Authentication failure"}
  end

  def process_authorization_header
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

  def item_from_uid(uid)
    if uid =~ /^(job|app|file)-(.{24})$/
      klass = {
        "job" => Job,
        "app" => App,
        "file" => UserFile
      }[$1]
      record = klass.find_by!(dxid: uid)
      if klass == "file" && record.parent_type == "Asset"
        record = record.becomes(Asset)
      end
      return record
    elsif uid =~ /^comparison-(\d+)$/
      # Transitional until comparisons get real dxids
      id = $1.to_i
      return Comparison.find_by!(id: id)
    elsif uid =~ /^note-(\d+)$/
      id = $1.to_i
      return Note.find_by!(id: id)
    else
      raise "Invalid id '#{uid}' in item_from_uid"
    end
  end
end
