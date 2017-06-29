class ApplicationController < ActionController::Base
  # Secure headers
  SecureHeaders::Configuration.default do |config|
    config.hsts = "max-age=#{20.years.to_i}; includeSubDomains; preload"
    config.x_frame_options = "DENY"
    config.x_content_type_options = "nosniff"
    config.x_xss_protection = "1; mode=block"
    config.x_download_options = "noopen"
    config.x_permitted_cross_domain_policies = "none"
    config.csp = {
      base_uri: %w('self'),
      block_all_mixed_content: true, # see [http://www.w3.org/TR/mixed-content/](http://www.w3.org/TR/mixed-content/)
      child_src: %w('self' https://www.youtube.com blob:),
      connect_src: %w('self' https://dnanexus-platform-upload-prod.s3.amazonaws.com https://dnanexus-platform-upload-stg.s3.amazonaws.com https://s3.amazonaws.com https://stagingdl.dnanex.us https://dl.dnanex.us https://api.dnanexus.com),
      default_src: %w(https: 'self'),
      font_src: %w('self' https://fonts.gstatic.com https://cdnjs.cloudflare.com),
      form_action: %w('self' https://stagingdl.dnanex.us https://dl.dnanex.us),
      frame_ancestors: %w('none'),
      frame_src: %w('self' https://www.youtube.com https://www.google.com https://www.gstatic.com),
      img_src: %w(* data:),
      media_src: %w('self'),
      object_src: %w('self'),
      plugin_types: %w(application/x-shockwave-flash application/pdf),
      script_src: %w('self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://www.google-analytics.com https://cdnjs.cloudflare.com https://www.youtube.com https://s.ytimg.com https://dnanexus.github.io),
      style_src: %w('self' 'unsafe-inline' https://fonts.googleapis.com https://dnanexus.github.io https://cdnjs.cloudflare.com),
      report_only: false,
      report_uri: %w(https://dc95b34a080e9c95bbce7c3e6aed6234.report-uri.io/r/default/csp/enforce)
    }
    hpkp = {
      report_only: false,
      report_uri: 'https://dc95b34a080e9c95bbce7c3e6aed6234.report-uri.io/r/default/hpkp/enforce',
      max_age: 5.minutes.to_i,
      include_subdomains: false
    }
    if ENV["DNANEXUS_BACKEND"] == "production"
      hpkp[:pins] = [
        {sha256: 'OV/2vGzq4A/PlbCUFpy5W2dHmMLPvHZ9N/FVDOPNvQw='},
        {sha256: 'Hxbr0eK3F0xc4UkeXRvapzSvj3I0efJ+2h2Q70MpltM='},
        {sha256: 'AGLBxCqwOTXOZg/v14oxVzHbU0GVWr1QlHR7DQqnzvU='},
        {sha256: '154XxB1J9PKgQ2rcgEEsTY+0CPdx03PpIiiJPlJzAXk='}
      ]
      hpkp[:max_age] = 7.days.to_i
    else
      hpkp[:pins] = [
        {sha256: 'gtfblKFG3oCmgxfjddilwzBgaudaW3XyH7M90LrfjOU='},
        {sha256: 'x8W1sshBVav03Hgxxp+PRD5f3xs0yIBmNpph3krjGqM='},
        {sha256: 'TZqk8OpJ8n7+4M25OqUSfDZ+917bcso0RVa4ZMvdvXQ='}
      ]
    end
    config.hpkp = hpkp
  end

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # Decode context
  before_action :decode_context

  # Require login
  before_action :require_login

  helper_method :pathify, :pathify_comments, :item_from_uid

  rescue_from ActionView::MissingTemplate, with: :missing_template

  private

  def current_context
    return @context
  end

  def current_user
    return @context.user
  end

  def missing_template
    render nothing: true, status: 406
  end

  def decode_context
    @context = Context.new(session[:user_id], session[:username], session[:token], session[:expiration], session[:org_id])
  end

  def generate_auth_key(duration = 1.day)
    # Generate new token for pfda uploader
    context = @context.as_json.slice("user_id", "username", "token", "expiration", "org_id")
    context["expiration"] = [context["expiration"], Time.now.to_i + duration].min
    return rails_encryptor.encrypt_and_sign({context: context}.to_json)
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

  def get_preview_link(context, id)
    file = UserFile.accessible_by(context).find_by!(dxid: id)
    if file.nil? || file.state != "closed" || file.file_size > 5000000
      return false
    else
      # Preview only lasts 5 minutes
      opts = {project: file.project, preauthenticated: true, filename: file.name, duration: 300}
      url = DNAnexusAPI.new(context.token).call(file.dxid, "download", opts)["url"]
    end
    return url
  end

  def pathify(item)
    case item.klass
    when "file"
      file_path(item.dxid)
    when "note"
      if item.note_type == "Answer"
        pathify(item.answer)
      elsif item.note_type == "Discussion"
        pathify(item.discussion)
      else
        note_path(item)
      end
    when "app"
      app_path(item.dxid)
    when "app-series"
      pathify(item.latest_accessible(@context))
    when "job"
      job_path(item.dxid)
    when "asset"
      asset_path(item.dxid)
    when "comparison"
      comparison_path(item)
    when "discussion"
      discussion_path(item)
    when "answer"
      discussion_answer_path(item.discussion, item.user.dxuser)
    when "user"
      user_path(item.dxuser)
    when "license"
      license_path(item)
    when "space"
      space_path(item)
    when "meta-appathon"
      meta_appathon_path(item)
    when "appathon"
      appathon_path(item)
    when "expert"
      expert_path(item)
    when "expert-question"
      expert_expert_question_path(item.expert_id, item.id)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def pathify_comments(item)
    case item.klass
    when "file"
      file_comments_path(item.dxid)
    when "note"
      if item.note_type == "Answer"
        pathify_comments(item.answer)
      elsif item.note_type == "Discussion"
        pathify_comments(item.discussion)
      else
        note_comments_path(item)
      end
    when "app"
      app_comments_path(item.dxid)
    when "job"
      job_comments_path(item.dxid)
    when "asset"
      asset_comments_path(item.dxid)
    when "comparison"
      comparison_comments_path(item)
    when "discussion"
      discussion_comments_path(item)
    when "answer"
      discussion_answer_comments_path(item.discussion, item.user.dxuser)
    when "space"
      space_comments_path(item)
    when "meta-appathon"
      meta_appathon_comments_path(item)
    when "appathon"
      appathon_comments_path(item)
    when "expert-question"
      expert_expert_question_comments_path(item.expert_id, item.id)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def pathify_comments_redirect(item)
    case item.klass
    when "discussion"
      discussion_comments_path(item)
    when "note"
      if item.note_type == "Answer"
        pathify_comments_redirect(item.answer)
      elsif item.note_type == "Discussion"
        pathify_comments_redirect(item.discussion)
      else
        pathify(item)
      end
    when "space"
      discuss_space_path(item)
    when "expert", "expert-question", "meta-appathon", "appathon", "file", "app", "job", "asset", "comparison", "answer", "space"
      pathify(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def item_from_uid(uid, specified_klass = nil)
    if uid =~ /^(job|app|file)-(.{24})$/
      klass = {
        "job" => Job,
        "app" => App,
        "file" => UserFile
      }[$1]
      raise "Class '#{klass}' did not match specified class '#{specified_klass}'" if specified_klass && klass != specified_klass
      record = klass.find_by!(dxid: uid)
      if klass == UserFile && record.parent_type == "Asset"
        record = record.becomes(Asset)
      end
      return record
    elsif uid =~ /^(app-series|appathon|comparison|note|discussion|answer|user|license|space|challenge)-(\d+)$/
      klass = {
        "app-series" => AppSeries,
        "appathon" => Appathon,
        "comparison" => Comparison,
        "note" => Note,
        "discussion" => Discussion,
        "answer" => Answer,
        "user" => User,
        "license" => License,
        "space" => Space,
        "challenge" => Challenge
      }[$1]
      id = $2.to_i
      raise "Class '#{klass}' did not match specified class '#{specified_klass}'" if specified_klass && klass != specified_klass
      return klass.find_by!(id: id)
    else
      raise "Invalid id '#{uid}' in item_from_uid"
    end
  end

  def type_from_classname(klass)
    case klass
    when "file"
      "UserFile"
    else
      klass.capitalize
    end
  end

  def get_item_array_from_params
    if params[:discussion_id].present?
      discussion = Discussion.find(params[:discussion_id])
      if params[:answer_id].present?
        user = User.find_by!(dxuser: params[:answer_id])
        answer = Answer.find_by!(discussion_id: params[:discussion_id], user_id: user.id)
        return [discussion, answer]
      else
        return [discussion]
      end
    elsif params[:meta_appathon_id].present?
        meta_appathon = MetaAppathon.find(params[:meta_appathon_id])
        if params[:appathon_id].present?
          appathon = Appathon.find_by!(meta_appathon_id: params[:meta_appathon_id], id: params[:appathon_id])
          return [meta_appathon, appathon]
        else
          return [meta_appathon]
        end
    elsif params[:appathon_id].present?
      return [Appathon.find(params[:appathon_id])]
    elsif params[:note_id].present?
      return [Note.find(params[:note_id])]
    elsif params[:space_id].present?
      return [Space.find(params[:space_id])]
    elsif params[:comparison_id].present?
      return [Comparison.find(params[:comparison_id])]
    elsif params[:file_id].present?
      return [UserFile.find_by!(dxid: params[:file_id])]
    elsif params[:asset_id].present?
      return [Asset.find_by!(dxid: params[:asset_id])]
    elsif params[:job_id].present?
      return [Job.find_by!(dxid: params[:job_id])]
    elsif params[:app_id].present?
      return [App.find_by!(dxid: params[:app_id])]
    elsif params[:expert_id].present?
      expert = Expert.find(params[:expert_id])
      if params[:expert_question_id].present?
        return [expert, ExpertQuestion.find(params[:expert_question_id])]
      end
      return [expert]
    end
    return
  end

  def describe_for_api(object, opts = {})
    opts = {} if opts.nil? || !opts.is_a?(Hash)

    accessible = object.accessible_by?(@context)
    item_sliced = object.context_slice(@context, *object.describe_fields)

    describe = {
      id: item_sliced[:id],
      uid: item_sliced[:uid],
      className: item_sliced[:klass],
      fa_class: view_context.fa_class(object),
      scope: item_sliced[:scope],
      path: accessible ? pathify(object) : nil,
      editable: object.editable_by?(@context),
      accessible: accessible,
      public: object.public?,
      private: object.private?,
      in_space: object.in_space?
    }

    if accessible && !item_sliced[:item].nil?
      # Only return fields user has asked for
      if opts[:fields].present? && opts[:fields].is_a?(Array) && opts[:fields].all? { |f|
        f.is_a?(String) }
        describe.merge!(item_sliced[:item].slice(*opts[:fields]))
      # Use the default fields
      else
        describe.merge!(item_sliced[:item])
      end
    # Return uid as the title if not accessible
    else
      describe[:title] = item_sliced[:uid]
    end

    if accessible && opts[:include].present? && opts[:include].is_a?(Hash)
      if opts[:include][:license] && ALLOWED_CLASSES_FOR_LICENSE.include?(object.klass)
        if object.license.present?
          describe[:license] = object.license.slice(:id, :uid, :approval_required)
          describe[:user_license] = {
            accepted: object.licensed_by?(@context),
            pending: object.licensed_by_pending?(@context),
            unset: !object.licensed_by_set?(@context)
          }
        end
      end
      if opts[:include][:all_tags_list]
        if object.klass == 'app'
          describe[:all_tags_list] = object.app_series.all_tags_list
        elsif ALLOWED_CLASSES_FOR_TAGGING.include?(object.klass)
          describe[:all_tags_list] = object.all_tags_list
        end
      end
      if opts[:include][:user]
        describe[:user] = object.user.slice(:dxuser, :full_name)
      end
      if opts[:include][:org]
        describe[:org] = object.user.org.slice(:handle, :name)
      end
    end
    return describe
  end

end
