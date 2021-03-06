# rubocop:todo Style/Documentation
class MainController < ApplicationController # rubocop:todo Metrics/ClassLength
  include Recaptcha::Adapters::ControllerMethods

  # rubocop:todo Rails/LexicallyScopedActionFilter
  skip_before_action :require_login, only: %i( # rubocop:todo Rails/LexicallyScopedActionFilter
                                               index
                                               about
                                               terms
                                               login
                                               return_from_login
                                               request_access
                                               create_request_access
                                               guidelines
                                               browse_access
                                               destroy
                                               presskit
                                               news
                                               mislabeling)
  # rubocop:enable Rails/LexicallyScopedActionFilter

  # rubocop:todo Rails/LexicallyScopedActionFilter
  skip_before_action :require_login, only: %i(track ae_anomaly_detection)
  # rubocop:enable Rails/LexicallyScopedActionFilter
  before_action :require_login_or_guest, only: %i(track)
  before_action :init_countries, only: %i(request_access create_request_access)

  def index # rubocop:todo Metrics/MethodLength
    show_guidelines = false
    @consistency_discussion = Discussion.accessible_by_public.find_by(id: CONSISTENCY_DISCUSSION_ID)
    @truth_discussion = Discussion.accessible_by_public.find_by(id: TRUTH_DISCUSSION_ID)

    @consistency_challenge = FixedChallenge.consistency(@context)
    @truth_challenge = FixedChallenge.truth(@context)
    @appathons_challenge = FixedChallenge.appathons(@context)

    @challenges = Challenge.all.order(start_at: :desc)

    @experts = Expert.public.order(created_at: :desc).limit(10) # TODO: filter by published ones only

    @news_items = NewsItem.published.positioned

    @meta_appathon = MetaAppathon.active
    if @meta_appathon.present?
      @user_appathon = @context.user.appathon_from_meta(@meta_appathon) if @context.logged_in?
    end

    if @context.logged_in_or_guest?
      @feed = collect_feed

      if @context.logged_in?
        @notes_count = Note.real_notes.editable_by(@context).count
        @files_count = UserFile.real_files.editable_by(@context).count
        @comparisons_count = Comparison.editable_by(@context).count
        @apps_count = App.editable_by(@context).count
        @jobs_count = Job.editable_by(@context).count
        @assets_count = Asset.editable_by(@context).count
        unless @context.user.has_seen_guidelines
          User.transaction do
            user = User.find(@context.user_id)
            unless user.has_seen_guidelines # rubocop:todo Metrics/BlockNesting
              user.has_seen_guidelines = true
              user.save(validate: false)
              show_guidelines = true
            end
          end
        end

        login_tasks_processor = DIContainer.resolve("orgs.login_tasks_processor")
        login_tasks_processor.call(@context.user)
      else
        @tutorials = [
          {
            title: "Explore notes",
            path: Rails.application.routes.url_helpers.explore_notes_path,
            help_label: "Learn",
            help_path: Rails.application.routes.url_helpers.show_docs_path("notes"),
            description: "Read what others are reporting describing their thoughts and their work",
          },
          {
            title: "Explore files",
            path: Rails.application.routes.url_helpers.explore_files_path,
            help_label: "Learn",
            help_path: Rails.application.routes.url_helpers.show_docs_path("files"),
            description: "Browse the datasets have been publicly shared with the precisionFDA community",
          },
          {
            title: "Explore Comparisons",
            path: Rails.application.routes.url_helpers.explore_comparisons_path,
            help_label: "Learn",
            help_path: Rails.application.routes.url_helpers.show_docs_path("comparisons"),
            description: "View the differences between test sets and benchmark sets of genomic variants",
          },
          {
            title: "Explore Apps",
            path: Rails.application.routes.url_helpers.explore_apps_path,
            help_label: "Learn",
            help_path: Rails.application.routes.url_helpers.show_docs_path("apps"),
            description: "Have a look at bioinformatics apps &mdash; and even study their scripts by clicking 'Fork'.",
          },
          {
            title: "Browse Assets",
            path: Rails.application.routes.url_helpers.explore_assets_path,
            help_label: "Learn",
            help_path: Rails.application.routes.url_helpers.show_docs_path("creating_apps") + "#dev-assets",
            description: "Browse the collection of software assets that are used as building blocks in apps.",
          },
          {
            title: "Try the app editor",
            path: Rails.application.routes.url_helpers.new_app_path,
            help_label: "Learn",
            help_path: Rails.application.routes.url_helpers.show_docs_path("creating_apps"),
            description: "Find out how easy it is to assemble an app (read-only; results not saved)",
          },
        ]
      end
    else
      @participant_orgs = Participant.org.positioned
      @participants = Participant.person.positioned
    end

    @get_started_boxes = GetStartedBox.visible.positioned

    js show_guidelines: show_guidelines
  end

  def destroy
    if @context.logged_in?
      Auditor.perform_audit(action: "destroy", record_type: "Session", record: { message: "User #{session[:username]} logged out" })
    end

    Session.where(key: session_id).delete_all
    DIContainer.shutdown
    reset_session
    flash[:success] = "You were successfully logged out of precisionFDA"
    redirect_to root_url
  end

  def about; end

  def guidelines; end

  def news
    @news_items = NewsItem.positioned.published
  end

  def presskit # rubocop:todo Metrics/MethodLength
    @images = [
      {
        title: "precisionFDA - white",
        path: "presskit/precisionFDA.white.png",
        css: "list-group-item-dark",
        height: "100px",
      },
      {
        title: "precisionFDA - dark",
        path: "presskit/precisionFDA.dark.png",
        height: "100px",
      },
      {
        title: "precisionFDA - favicon - blue",
        path: "presskit/pfda.favicon.blue.688x688.png",
        height: "100px",
      },
      {
        title: "precisionFDA - favicon - white",
        path: "presskit/pfda.favicon.white.688x688.png",
        height: "100px",
      },
      {
        title: "Logomark - blue",
        path: "presskit/pfda.logomark.png",
        height: "100px",
      },
      {
        title: "FDA",
        path: "presskit/fda_ucm519147.png",
      },
    ]

    @badges = [
      {
        title: "Member",
        path: "presskit/badges/pfda-badge-member-large.png",
        height: "250px",
      },
      {
        title: "App-a-thon Participant",
        path: "presskit/badges/pfda-badge-appathon-participant-large.png",
        height: "250px",
      },
      {
        title: "Challenge Participant",
        path: "presskit/badges/pfda-badge-challenger-large.png",
        height: "250px",
      },
      {
        title: "Challenge Award (only for award recipients)",
        path: "presskit/badges/pfda-badge-challenge-award-large.png",
        height: "250px",
      },
    ]
  end

  def login
    if @context.guest?
      render "_partials/_error", status: :forbidden, locals: { message: "You are currently browsing precisionFDA as a guest. To log in and complete this action, your user account must be provisioned. Your account is currently being reviewed by an FDA administrator for provisioning. If you do not receive full access within 14 days, please contact precisionfda@fda.hhs.gov to request an upgraded account with end-level access." }
    else
      redirect_to "#{DNANEXUS_AUTHSERVER_URI}oauth2/authorize?response_type=code&client_id=#{OAUTH2_CLIENT_ID}&redirect_uri=#{URI.encode_www_form_component(OAUTH2_REDIRECT_URI)}"
    end
  end

  def return_from_login # rubocop:todo Metrics/MethodLength
    # Ensure we were sent here from DNAnexus
    if unsafe_params[:code].blank? || !unsafe_params[:code].is_a?(String)
      redirect_to(root_url) && return
    end

    # Exchange the code for a token
    result = DNAnexusAuth.new(DNANEXUS_AUTHSERVER_URI).
      fetch_token(unsafe_params[:code])

    if result["access_token"].blank? ||
       result["token_type"] != "bearer"

      redirect_to(root_url) && return
    end

    token = result["access_token"]

    # Extract username
    full_username = result["user_id"]
    raise unless full_username.start_with?("user-")

    username = full_username[/^user-(.+)$/, 1]

    # Prepare data for Audit log
    Auditor.current_user = AuditLogUser.new(username, request.remote_ip)

    # Extract expiration date
    expiration_duration = result["expires_in"].to_i
    expiration_time = Time.now.to_i + expiration_duration

    user = User.find_by(dxuser: username)
    if user.nil?
      log_session("User #{username} attempted to log in from an existing DNAnexus account")

      render "_partials/_error", status: :forbidden, locals: { message: "ERROR: You cannot use an existing DNAnexus account (#{username}) to log into precisionFDA. You need to apply for and obtain a separate precisionFDA account." }
    elsif user.present? && user.user_state != "enabled"
      log_session("User #{username} attempted to log in from locked/disabled DNAnexus account")

      render "_partials/_error", status: :forbidden, locals: { message: "ERROR: You need to contact ADMIN to re-enable your account." }
    else
      if user.last_login.nil? && user.private_files_project.nil?
        api = DNAnexusAPI.new(token)

        log_session("User #{username} is logging in for the first time; account setup step 1 of 9 completed")

        # Private files
        private_files_project = api.call("project", "new", name: "precisionfda-personal-files-#{username}", billTo: user.billto)["id"]

        log_session("User #{username} is logging in for the first time; account setup step 2 of 9 completed")

        # Private comparisons
        private_comparisons_project = api.call("project", "new", name: "precisionfda-personal-comparisons-#{username}", billTo: user.billto)["id"]

        log_session("User #{username} is logging in for the first time; account setup step 3 of 9 completed")

        # Public files
        public_files_project = api.call("project", "new", name: "precisionfda-public-files-#{username}", billTo: user.billto)["id"]
        log_session("User #{username} is logging in for the first time; account setup step 4 of 9 completed")
        api.call(public_files_project, "invite", invitee: ORG_EVERYONE, level: "VIEW", suppressEmailNotification: true, suppressAllNotifications: true)
        log_session("User #{username} is logging in for the first time; account setup step 5 of 9 completed")

        # Public comparisons
        public_comparisons_project = api.call("project", "new", name: "precisionfda-public-comparisons-#{username}", billTo: user.billto)["id"]
        log_session("User #{username} is logging in for the first time; account setup step 6 of 9 completed")

        api.call(public_comparisons_project, "invite", invitee: ORG_EVERYONE, level: "VIEW", suppressEmailNotification: true, suppressAllNotifications: true)
        log_session("User #{username} is logging in for the first time; account setup step 7 of 9 completed")

        # User settings
        api.call(full_username, "update", policies: { emailWhenJobComplete: "never" })
        log_session("User #{username} is logging in for the first time; account setup step 8 of 9 completed")

        User.transaction do
          user.reload
          if user.last_login.nil? && user.private_files_project.nil?
            user.private_files_project = private_files_project
            user.private_comparisons_project = private_comparisons_project
            user.public_files_project = public_files_project
            user.public_comparisons_project = public_comparisons_project
            log_session("User #{username} is logging in for the first time; account setup step 9 of 9 completed")
          end
          user.last_login = Time.zone.now
          user.save(validate: false)
          set_time_zone(user)
        end
      else
        User.transaction do
          user.reload
          user.last_login = Time.zone.now
          user.save(validate: false)
        end
      end

      Session.delete_expired

      if Session.limit_reached?(user)
        flash[:error] = "You have reached a limit for login. You can use only #{SESSIONS_LIMIT} active sessions."
      else
        Session.where(key: session_id).delete_all
        reset_session
        save_session(user.id, username, token, expiration_time, user.org_id)
        log_session("User #{username} logged in")
        Event::UserLoggedIn.create_for(user)
      end
      distribute_results user, token
      redirect_to root_url
    end
  end

  def distribute_results(user, token) # rubocop:todo Metrics/MethodLength
    user_api = DNAnexusAPI.new(token)
    api = DNAnexusAPI.for_challenge_bot
    user_api.project_invite(
      user.private_files_project,
      "user-#{CHALLENGE_BOT_DX_USER}",
      "ADMINISTER",
      suppressEmailNotification: true,
      suppressAllNotifications: true,
    )
    Dir.glob(Rails.root.join("challenge_results/*")).each do |fname|
      csv_text = File.read(fname.to_s)
      csv = CSV.parse(csv_text, headers: false, col_sep: "\t")
      csv.each do |row|
        next unless row[0] == user.dxuser

        file = UserFile.find_by(uid: (row[1] + "-2"))
        result = api.call(file.project,
                          "clone",
                          "project" => user.private_files_project,
                          "objects" => [row[1]])
        next if result["exists"].include?(row[1])

        new_file = file.dup
        new_file.update!(
          state: UserFile::STATE_CLOSED,
            scope: "private",
            project: user.private_files_project,
            scoped_parent_folder_id: nil,
            parent: user,
            user: user,
            parent_folder_id: nil,
        )
      end
    end
    user_api.project_decrease_permissions(
      user.private_files_project,
      "NONE",
      "user-#{CHALLENGE_BOT_DX_USER}",
    )
  end

  def request_access
    @invitation = Invitation.new

    js usa_id: Country.usa.id,
       country_codes: Country.countries_for_codes,
       phone_confirmed: unsafe_params.dig(:invitation, :phone_confirmed)
  end

  def create_request_access
    @invitation = Invitation.new

    if verify_recaptcha(model: @invitation)
      @invitation = RequestAccessService.create_request_for_access(invitation_params)
    end

    render :request_access
  end

  def browse_access
    if @context.logged_in_or_guest?
      redirect_to root_url
      return
    end

    code = unsafe_params[:code].to_s
    @invitation = Invitation.find_by(code: code, state: "guest")
    if @invitation.blank?
      render "_partials/_error", status: :forbidden, locals: { message: "Invalid access code. If you believe this is an error, contact precisionFDA support." }
      return
    end

    if @invitation.expired?
      render "_partials/_error", status: :forbidden, locals: { message: "Your access code is expired. If you believe this is an error, contact precisionFDA support." }
      return
    end

    if request.post? # rubocop:todo Style/GuardClause
      save_session(-1, "Guest-#{@invitation.id}", "INVALID", @invitation.expires_at.to_i, -1)
      auditor_data = {
        action: "create",
        record_type: "Access Request",
        record: {
          message: "Browse access granted for #{@invitation.email} (id #{@invitation.id})",
        },
      }
      Auditor.perform_audit(auditor_data)
      redirect_to root_url
    end
  end

  def publish # rubocop:todo Metrics/MethodLength
    id = unsafe_params[:id]
    raise "Missing id in publish route" unless id.is_a?(String) && id.present?

    service = SpaceService::Publishing.new(@context)

    check_result = service.scope_check(unsafe_params[:scope])
    scope = check_result[:scope]
    space = check_result[:space]

    if unsafe_params[:uids]
      uids = unsafe_params[:uids]
      if !uids.is_a?(Hash) || !uids.all? { |uid, checked| uid.is_a?(String) && checked == "on" }
        raise "The object 'uids' must be a hash of object ids (strings) with value 'on'."
      end

      items = ([id] + uids.keys).uniq.map { |uid| item_from_uid(uid) }.reject { |item| item.public? || item.scope == scope }
      unless items.all? { |item| item.publishable_by?(@context, scope) }
        raise "Unpublishable items detected"
      end

      # Files to publish:
      # - All real_files selected by the user
      # - All assets selected by the user
      files = items.select { |item| item.klass == "file" || item.klass == "asset" }

      # Comparisons
      comparisons = items.select { |item| item.klass == "comparison" }

      # Apps
      apps = items.select { |item| item.klass == "app" }

      # Jobs
      jobs = items.select { |item| item.klass == "job" }

      # Notes
      notes = items.select { |item| item.klass == "note" }

      # Discussions
      discussions = items.select { |item| item.klass == "discussion" }

      # Answers
      answers = items.select { |item| item.klass == "answer" }

      # Workflows
      workflows = items.select { |item| item.klass == "workflow" }

      published_count = 0

      # Files
      published_count += UserFile.publish(files, @context, scope) unless files.empty?

      # Comparisons
      published_count += Comparison.publish(comparisons, @context, scope) unless comparisons.empty?

      # Apps
      published_count += AppSeries.publish(apps, @context, scope) unless apps.empty?

      # Jobs
      unless jobs.empty?
        published_count += PublishService::JobPublisher.new(@context).publish(jobs, scope)
      end

      # Notes
      published_count += Note.publish(notes, @context, scope) unless notes.empty?

      # Discussions
      published_count += Discussion.publish(discussions, @context, scope) unless discussions.empty?

      # Answers
      published_count += Answer.publish(answers, @context, scope) unless answers.empty?

      if workflows.any?
        PublishService::WorkflowPublisher.call(workflows, @context, scope)
        published_count += workflows.count
      end

      message = published_count.to_s
      message += " (out of #{items.count})" if published_count != items.count
      message += if published_count == 1
        " item has been published."
      else
        " items have been published."
      end
      flash[:success] = message
      item = item_from_uid(id)
      path = concat_path(item)

      redirect_to path
      return
    end

    item = item_from_uid(id)
    path_item = concat_path(item)

    unless item.editable_by?(@context)
      flash[:error] = "This item is not owned by you."
      redirect_back(fallback_location: root_path) && return
    end

    if item.public?
      flash[:error] = "This item is already public."
      redirect_to(path_item) && return
    end

    unless item.publishable_by?(@context, scope)
      flash[:error] = "This item cannot be published in this state."
      redirect_to(path_item) && return
    end

    js graph: GraphDecorator.for_publisher(@context, item, scope),
       space: space.nil? ? nil : space.slice(:uid, :title),
       scope_to_publish_to: scope, message: t("main.publish.apps_notification")
  end

  def track
    id = unsafe_params[:id]
    raise "Missing id in track route" unless id.is_a?(String) && id.present?

    @item = item_from_uid(id)
    unless @item.accessible_by?(@context)
      flash[:error] = "This item is not accessible by you"
      redirect_to :root
      return
    end
    @graph = GraphDecorator.build(@context, @item)
  end

  def tokify
    @key = generate_auth_key
  end

  # Inputs
  #
  # taggable_uid (string, required): the uid of the item to tag
  # tags (string, required): comma-separated string containing tags to update to,
  #                this will replace existing tags
  # suggested_tags (array[strings], optional): array of tags
  # tag_context (string, optional): indicates the tag context to use
  def set_tags
    taggable_uid = unsafe_params["taggable_uid"]
    unless taggable_uid.is_a?(String) && taggable_uid != ""
      raise "Taggable uid needs to be a non-empty string"
    end

    tags = unsafe_params["tags"]
    raise "Tags need to be comma-separated strings" unless tags.is_a?(String)

    suggested_tags = unsafe_params["suggested_tags"] # Optional
    tags = (tags.split(",") + suggested_tags).join(",") if suggested_tags.is_a?(Array)

    tag_context = unsafe_params["tag_context"] # Optional

    taggable = item_from_uid(taggable_uid)

    if taggable.editable_by?(@context)
      path_to_redirect = pathify(taggable)
      @context.user.tag(taggable, with: tags, on: tag_context.presence || :tags)
      redirect_to path_to_redirect
    else
      flash[:error] = "This item is not accessible by you"
      redirect_to :root
    end
  end

  private

  # Concat item path with '/home' to create a link to Home - for specific items
  def concat_path(item)
    if ["file", "folder", "app", "app-series", "job", "asset", "workflow", "workflow-series"].
        include? item.klass
      "/home".concat(pathify(item))
    else
      pathify(item)
    end
  end

  def init_countries
    @countries = Country.pluck(:name, :id)
    @us_states_list = Country.us_states_list
    @dial_codes = Country.dial_codes
  end

  # rubocop:disable Metrics/MethodLength
  def invitation_params
    fields = %i(
      first_name
      last_name
      email
      duns
      address1
      address2
      country_id
      us_state
      city
      postal_code
      phone_country_id
      phone
      participate_intent
      organize_intent
      req_reason
      req_data
      req_software
      research_intent
      clinical_intent
    )

    hsh = unsafe_params[:invitation].slice(*fields)

    hsh.merge(
      "ip" => request.remote_ip.to_s,
      "state" => "guest",
      "participate_intent" => hsh["participate_intent"] == "1",
      "organize_intent" => hsh["organize_intent"] == "1",
      "research_intent" => hsh["research_intent"] == "1",
      "clinical_intent" => hsh["clinical_intent"] == "1",
      "email" => hsh["email"].to_s.strip,
    )
  end
  # rubocop:enable Metrics/MethodLength

  def collect_feed
    [Note, Answer, Discussion, UserFile, Comparison, App, Asset].map do |klass|
      klass.where(user: User.real).accessible_by_public.order(updated_at: :desc).limit(4)
    end.sum.sort_by(&:updated_at).reverse
  end

  def set_time_zone(user) # rubocop:todo Naming/AccessorMethodName
    return if user.time_zone.present?
    return if cookies[:user_time_zone].blank?

    user.update_time_zone(cookies[:user_time_zone])
  end

  def log_session(message)
    data = {
      action: "create",
      record_type: "Session",
      record: {
        message: message,
      },
    }
    Auditor.perform_audit(data)
  end
end
# rubocop:enable Style/Documentation
