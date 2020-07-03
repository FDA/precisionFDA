# Base controller for whole application.
class ApplicationController < ActionController::Base
  include PathHelper
  include UidFindable

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # if we have some invalid forms redirect to root page.
  rescue_from ActionController::InvalidAuthenticityToken, with: :invalid_token

  before_action :cache_headers

  # Decode context
  before_action :handle_session, :decode_context

  # Audit log
  before_action :save_current_user_for_audit

  # Require login
  before_action :require_login

  before_action :create_user_viewed_event

  # Use time zone of current user
  around_action :user_time_zone, if: -> { !@context.guest? && current_user }

  helper_method :pathify, :pathify_comments, :item_from_uid, :pathify_folder, :current_user

  rescue_from ActionView::MissingTemplate, with: :missing_template

  add_flash_types :success, :error

  private

  # Returns hash of params.
  # @return [Hash] Params.
  def unsafe_params
    @unsafe_params ||= params.to_unsafe_h
  end

  # Redirects user to root with a error message.
  def invalid_token
    redirect_to root_path, status: :see_other, alert: "Invalid session"
  end

  # Returns application context.
  # @return [Context] Application context.
  def current_context
    @context
  end

  # Returns current user.
  # @return [User] Current user.
  def current_user
    @context.user
  end

  # Renders nothing with Not Acceptable status.
  def missing_template
    render nothing: true, status: :not_acceptable
  end

  # Creates application context from session.
  def decode_context
    init_context(
      session[:user_id],
      session[:username],
      session[:token],
      session[:expiration],
      session[:org_id],
    )
  end

  # Sets user for audit log.
  def save_current_user_for_audit
    Auditor.current_user = AuditLogUser.new(@context.username, request.remote_ip)
  end

  # Generates auth key and returns it.
  # @param duration [ActiveSupport::Duration] Period of time the key will be valid for.
  # @return [String] Generated key.
  def generate_auth_key(duration = 1.day)
    # Generate new token for pfda uploader
    context = @context.as_json.slice("user_id", "username", "token", "expiration", "org_id")
    context["expiration"] = [context["expiration"], Time.now.to_i + duration].min
    rails_encryptor.encrypt_and_sign({ context: context }.to_json)
  end

  # Resets and saves new session.
  # @return [Session] Created session.
  def save_session(user_id, username, token, expiration, org_id)
    reset_session
    session[:user_id] = user_id
    session[:username] = username
    session[:token] = token
    session[:expiration] = expiration
    session[:org_id] = org_id
    Session.create(user_id: user_id, key: session_id)
  end

  # Redirects user to login page if user is not logged in.
  def require_login
    redirect_to login_url unless @context.logged_in?
  end

  # Redirect user to login page if user is not either guest or logged in.
  def require_login_or_guest
    redirect_to login_url unless @context.logged_in_or_guest?
  end

  # Tries to authorize user if the user is not authorized or guest one yet.
  # Renders Unauthorized if it was unable to authorize user.
  def require_api_login_or_guest
    if @context.logged_in_or_guest?
      return if verified_request?
    else
      process_authorization_header
      return if @context.logged_in?
    end

    render status: :unauthorized, json: { failure: "Authentication failure" }
  end

  # Tries to authorize user if the user is not authorized.
  # Renders Unauthorized if it was unable to authorize user.
  def require_api_login
    if @context.logged_in?
      return if verified_request?
    else
      process_authorization_header
      return if @context.logged_in?
    end

    render status: :unauthorized, json: { failure: "Authentication failure" }
  end

  # Redirects user to given URL if request isn't XHR.
  # @param redirect [String] URL to redirect user to.
  def require_xhr(redirect = root_path)
    redirect_to(redirect) unless request.xhr?
  end

  # Tries to authorize user from Authentication header and to set application context.
  def process_authorization_header
    auth = request.headers["Authorization"]

    if auth.is_a?(String) && auth =~ /^Key (.+)$/
      key = $1
      begin
        decrypted = JSON.parse(rails_encryptor.decrypt_and_verify(key))
        if decrypted.is_a?(Hash) && decrypted["context"].is_a?(Hash)
          fields = %w(user_id username token expiration org_id).map { |f| decrypted["context"][f] }
          init_context(*fields)
        end
      rescue
      end
    end
  end

  # Initializes context and IOC container.
  # @param user_id [Integer] User's ID.
  # @param username [String] User's name.
  # @param token [String] User's token.
  # @param expiration [Integer] Token's expiration.
  # @param org_id [Integer] User org's ID.
  def init_context(user_id, username, token, expiration, org_id)
    @context = Context.new(user_id, username, token, expiration, org_id)
    DIContainer.configure(@context.user, token) unless @context.guest?
  end

  # Returns configured encryptor.
  # @return [ActiveSupport::MessageEncryptor]
  def rails_encryptor
    Rails.configuration.encryptor
  end

  # Builds and returns describing hash for given entity.
  # @param object [Mixed] Entity to build description for.
  # @param opts [Hash] Additional opts.
  # @return [Hash] Describing hash.
  def describe_for_api(object, opts = {})
    opts = {} if opts.nil? || !opts.is_a?(Hash)

    accessible = object.accessible_by?(@context)
    item_sliced = object.context_slice(@context, *object.describe_fields)
    scope = item_sliced[:scope]
    review_space = object.space_object if object.in_space?

    describe = {
      id: item_sliced[:id],
      uid: item_sliced[:uid],
      className: item_sliced[:klass],
      fa_class: view_context.fa_class(object),
      scope: scope,
      path: accessible ? pathify(object) : nil,
      owned: object.owned_by?(@context),
      editable: object.editable_by?(@context),
      accessible: accessible,
      file_path: object.is_a?(UserFile) ? object.file_full_path(scope) : nil,
      parent_folder_name: object.is_a?(UserFile) ? object.parent_folder_name(scope) : nil,
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
            unset: !object.licensed_by_set?(@context),
          }
        end
      end

      if opts[:include][:all_tags_list]
        if object.klass == "app"
          describe[:all_tags_list] = object.app_series.all_tags_list
        elsif ALLOWED_CLASSES_FOR_TAGGING.include?(object.klass)
          describe[:all_tags_list] = object.all_tags_list
        end
      end

      if opts[:include][:user]
        user = object.user
        describe[:user] = object.user.slice(:dxuser, :full_name) if user.present?
      end

      if opts[:include][:org]
        user = object.user
        describe[:org] = object.user.org.slice(:handle, :name) if user&.org
      end
    end

    describe
  end

  # Sets time zone for current user.
  # @yield
  def user_time_zone(&block)
    current_user.time_zone ? Time.use_zone(current_user.time_zone, &block) : yield
  end

  # Creates Event::UserViewed event if request is neither XHR nor non-GET.
  def create_user_viewed_event
    return if request.xhr? || !request.get?

    Event::UserViewed.create_for(@context, request.path)
  end

  # Destroys expired session or updates expiration time of not expired one.
  def handle_session
    return unless session[:user_id]

    ar_session = Session.find_by(key: session_id)

    unless ar_session
      reset_session
      return
    end

    if ar_session.expired?
      ar_session.destroy!
      DIContainer.shutdown
      reset_session
    else
      # rubocop:disable Rails/SkipsModelValidations
      ar_session.touch
      # rubocop:enable Rails/SkipsModelValidations
      cookies[:sessionExpiredAt] = MAX_MINUTES_INACTIVITY.minutes.since.to_i
    end
  end

  def session_auth_params
    session.to_hash.
      slice("user_id", "username", "token", "expiration", "org_id").
      with_indifferent_access
  end

  # Raises RoutingError.
  # @raise ActionController::RoutingError
  def not_found!
    raise ActionController::RoutingError, "Not Found"
  end

  # Sets cache headers for response.
  def cache_headers
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate, private"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
  end

  # Returns a session id.
  # @return [String] Session ID.
  def session_id
    session.id&.private_id
  end
end
