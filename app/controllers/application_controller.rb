class ApplicationController < ActionController::Base
  include PathHelper
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # if we have some invalid forms redirect to root page.
  rescue_from ActionController::InvalidAuthenticityToken, with: :invalid_token

  # Decode context
  before_action :handle_session, :decode_context

  # Audit log
  before_action :save_current_user_for_audit

  # Require login
  before_action :require_login

  before_action :create_user_viewed_event

  # Use time zone of current user
  around_action :user_time_zone, if: lambda { !@context.guest? && current_user }

  helper_method :pathify, :pathify_comments, :item_from_uid, :pathify_folder

  rescue_from ActionView::MissingTemplate, with: :missing_template

  private

  def invalid_token
    redirect_to root_path, status: :see_other, alert: "Invalid session"
  end

  def current_context
    return @context
  end

  def current_user
    @context.user
  end

  def missing_template
    render nothing: true, status: 406
  end

  def decode_context
    @context = Context.new(session[:user_id], session[:username], session[:token], session[:expiration], session[:org_id])
  end

  def save_current_user_for_audit
    Auditor.current_user = AuditLogUser.new(@context.username, request.remote_ip)
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
    Session.create(user_id: user_id, key: session.id)
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
    file = UserFile.accessible_by(context).find_by_uid!(id)
    if file.nil? || file.state != "closed" || file.file_size > 5000000
      return false
    else
      # Preview only lasts 5 minutes
      opts = {project: file.project, preauthenticated: true, filename: file.name, duration: 300}
      url = DNAnexusAPI.new(context.token).call(file.dxid, "download", opts)["url"]
    end
    return url
  end



  def pathify_folder(folder)
    if folder.private?
      files_path(folder_id: folder.id)
    elsif folder.public?
      explore_files_path(folder_id: folder.id)
    elsif folder.in_space?
      space = folder.space
      files_space_path(id: space.id, folder_id: folder.id)
    else
      raise "Unable to build folder's path"
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
    when "workflow"
      return workflow_analyses_path(item) if request.referer =~ /analyses/
      workflow_path(item)
    when "space"
      discuss_space_path(item)
    when "task"
      space_task_path(item.space_id, item)
    when "expert", "expert-question", "meta-appathon", "appathon", "file", "app", "job", "asset", "comparison", "answer", "space", "folder"
      pathify(item)
    else
      raise "Unknown class #{item.klass}"
    end
  end

  def item_from_uid(uid, specified_klass = nil)
    if  uid =~ /^(job|app|file|workflow)-(.{24,})$/
      klass = {
        "app" => App,
        "file" => UserFile,
        "job" => Job,
        "workflow" => Workflow,
      }[$1]
      raise "Class '#{klass}' did not match specified class '#{specified_klass}'" if specified_klass && klass != specified_klass
      klass.find_by_uid!(uid)
    elsif uid =~ /^(app-series|workflow-series|appathon|comparison|note|discussion|answer|user|license|space|challenge)-(\d+)$/
      klass = {
        "app-series" => AppSeries,
        "workflow-series" => WorkflowSeries,
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
      klass.find_by!(id: id)
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
    if params[:workflow_id].present?
      workflow = Workflow.find_by_uid(params[:workflow_id])
      return [workflow]
    end
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
    elsif params[:task_id].present?
      task = Task.find(params[:task_id])
      return [task.space, task]
    elsif params[:space_id].present?
      return [Space.find(params[:space_id])]
    elsif params[:comparison_id].present?
      return [Comparison.find(params[:comparison_id])]
    elsif params[:file_id].present?
      return [UserFile.find_by_uid!(params[:file_id])]
    elsif params[:asset_id].present?
      return [Asset.find_by_uid!(params[:asset_id])]
    elsif params[:job_id].present?
      return [Job.find_by_uid!(params[:job_id])]
    elsif params[:app_id].present?
      return [App.find_by_uid!(params[:app_id])]
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
    review_space = object.space_object if object.in_space?

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
      in_space: object.in_space?,
      space_private: review_space.present? && review_space.confidential?,
      space_public: review_space.present? && review_space.shared?,
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

  def user_time_zone(&block)
    if current_user.time_zone
      Time.use_zone(current_user.time_zone, &block)
    else
      yield
    end
  end

  def create_user_viewed_event
    return if request.xhr?
    return unless request.get?

    Event::UserViewed.create_for(@context, request.path)
  end

  def handle_session
    return unless session[:user_id]

    ar_session = Session.find_by(key: session.id)

    unless ar_session
      reset_session
      return
    end

    if ar_session.expired?
      ar_session.destroy!
      reset_session
    else
      ar_session.touch
      cookies[:sessionExpiredAt] = MAX_MINUTES_INACTIVITY.minutes.since.to_i
    end
  end

  def not_found!
    raise ActionController::RoutingError.new('Not Found')
  end

end
