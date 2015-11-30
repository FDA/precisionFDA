class MainController < ApplicationController
  skip_before_action :require_login, {only: [:index, :about, :exception_test, :login, :return_from_login, :request_access, :terms]}

  def index
    if @context.logged_in?
      @notes_count = Note.where(user_id: @context.user_id).count
      @files_count = UserFile.real_files.where(user_id: @context.user_id).count
      @comparisons_count = Comparison.where(user_id: @context.user_id).count
      @apps_count = App.where(user_id: @context.user_id).count
      @jobs_count = Job.where(user_id: @context.user_id).count
      @assets_count = Asset.where(user_id: @context.user_id).count
    end
  end

  def destroy
    AUDIT_LOGGER.info("User #{session[:username]} logged out")
    reset_session
    flash[:success] = "You were successfully logged out of precisionFDA"
    redirect_to root_url
  end

  def about
  end

  def exception_test
    raise "This is an intentionally raised exception for testing email notification. Please contact Evan with any concerns"
  end

  def login
    redirect_to "#{DNANEXUS_AUTHSERVER_URI}oauth2/authorize?response_type=code&client_id=#{OAUTH2_CLIENT_ID}&redirect_uri=#{URI.encode(OAUTH2_REDIRECT_URI)}"
  end

  def return_from_login
    # Ensure we were sent here from DNAnexus
    # TODO: Add referrer check
    raise unless params[:code].present? && params[:code].is_a?(String)

    # Exchange the code for a token
    result = DNAnexusAuth.new(DNANEXUS_AUTHSERVER_URI).post_form("oauth2/token", {grant_type: "authorization_code", code: params[:code], redirect_uri: OAUTH2_REDIRECT_URI})
    raise unless result["access_token"].present? && result["token_type"] == "bearer"
    token = result["access_token"]

    # Extract username
    full_username = result["user_id"]
    raise unless full_username.start_with?("user-")
    username = full_username[/^user-(.+)$/, 1]

    # Extract expiration date
    expiration_duration = result["expires_in"].to_i
    expiration_time = Time.now.to_i + expiration_duration

    user = User.find_by(dxuser: username)
    if user.nil?
      AUDIT_LOGGER.info("User #{username} attempted to log in from an existing DNAnexus account")
      render "_partials/_error", status: 403, locals: {message: "ERROR: You cannot use an existing DNAnexus account (#{username}) to log into precisionFDA. You need to apply for and obtain a separate precisionFDA account."}
    else
      User.transaction do
        user.reload
        if user.last_login.nil? && user.private_files_project.nil?
          api = DNAnexusAPI.new(token)
          # Private files
          private_files_project = api.call("project", "new", {name: "precisionfda-personal-files-#{username}", billTo: user.billto})["id"]
          # Private comparisons
          private_comparisons_project = api.call("project", "new", {name: "precisionfda-personal-comparisons-#{username}", billTo: user.billto})["id"]
          # Public files
          public_files_project = api.call("project", "new", {name: "precisionfda-public-files-#{username}", billTo: user.billto})["id"]
          api.call(public_files_project, "invite", {invitee: ORG_EVERYONE, level: "VIEW", suppressEmailNotification: true})
          # Public comparisons
          public_comparisons_project = api.call("project", "new", {name: "precisionfda-public-comparisons-#{username}", billTo: user.billto})["id"]
          api.call(public_comparisons_project, "invite", {invitee: ORG_EVERYONE, level: "VIEW", suppressEmailNotification: true})
          # User settings
          api.call(full_username, "update", {policies: {emailWhenJobComplete: "never"}})

          user.private_files_project = private_files_project
          user.private_comparisons_project = private_comparisons_project
          user.public_files_project = public_files_project
          user.public_comparisons_project = public_comparisons_project

          AUDIT_LOGGER.info("User #{username} logged in for the first time")
        end
        user.last_login = Time.now
        user.save!
      end
      save_session(user.id, username, token, expiration_time, user.org_id)
      AUDIT_LOGGER.info("User #{username} logged in")
      redirect_to root_path
    end
  end

  def request_access
    @invitation = Invitation.new
    if request.post?
      p = params.require(:invitation).permit(:first_name, :last_name, :email, :org, :duns, :address, :phone, :singular, :req_reason, :req_data, :req_software, :research_intent, :clinical_intent, :humanizer_answer, :humanizer_question_id)
      p[:ip] = request.remote_ip.to_s
      p[:research_intent] = (p[:research_intent] == "1")
      p[:clinical_intent] = (p[:clinical_intent] == "1")
      Invitation.transaction do
        @invitation = Invitation.create(p)
        if @invitation.persisted?
          AUDIT_LOGGER.info("Access requested: #{p.to_json}")
          NotificationsMailer.invitation_email(@invitation).deliver_now!
        end
      end
    end
  end

  def publish
    id = params[:id]
    raise "Missing id in publish route" unless id.is_a?(String) && id.present?

    if params[:uids]
      uids = params[:uids]
      raise "The object 'uids' must be a hash of object ids (strings) with value 'on'." unless uids.is_a?(Hash) && uids.all? { |uid, checked| uid.is_a?(String) && checked == "on" }

      items = ([id] + uids.keys).uniq.map { |uid| item_from_uid(uid) }.reject { |item| item.public? }
      raise "Unpublishable items detected" unless items.all? { |item| item.publishable_by?(@context) }

      # Comparisons
      comparisons = items.select { |item| item.klass == "comparison" }

      # Files to publish:
      # - All real_files selected by the user
      # - All assets selected by the user
      # - All comparison outputs (published separately as they are in another project)
      files = items.select { |item| item.klass == "file" || item.klass == "asset" }
      comparison_files = comparisons.map(&:outputs).flatten

      # Notes
      notes = items.select { |item| item.klass == "note" }

      # Jobs
      jobs = items.select { |item| item.klass == "job" }

      # Apps
      apps = items.select { |item| item.klass == "app" }

      # To minimize the opportunity for inconsistency, publishing is performed in
      # chunks of transactions, with priority for items requiring DNAnexus calls.
      #
      api = DNAnexusAPI.new(@context.token)
      user = User.find(@context.user_id)

      # Files
      if files.size > 0
        # Ensure API availability
        api.call("system", "greet")

        files.each do |file|
          raise "Consistency check failure for file #{file.dxid}" unless file.project == user.private_files_project
        end

        # First, copy files to public project
        api.call(user.private_files_project, "clone", {objects: files.map(&:dxid), project: user.public_files_project})
        # Update database
        UserFile.transaction do
          files.each do |file|
            file.reload
            file.update!(scope: 'public', project: user.public_files_project)
          end
        end
        # Then, remove files from private project
        api.call(user.private_files_project, "removeObjects", {objects: files.map(&:dxid)})
      end

      # Comparisons
      if comparisons.size > 0
        # Ensure API availability
        api.call("system", "greet")

        comparison_files.each do |file|
          raise "Consistency check failure for file #{file.dxid}" unless file.project == user.private_comparisons_project
        end

        # First, copy files to public project
        api.call(user.private_comparisons_project, "clone", {objects: comparison_files.map(&:dxid), project: user.public_comparisons_project})
        # Update database
        UserFile.transaction do
          comparison_files.each do |file|
            file.reload
            file.update!(scope: 'public', project: user.public_comparisons_project)
          end
          comparisons.each do |comparison|
            comparison.reload
            comparison.update!(scope: 'public')
          end
        end
        # Then, remove files from private project
        api.call(user.private_comparisons_project, "removeObjects", {objects: comparison_files.map(&:dxid)})
      end

      # Apps
      apps.each do |app|
        # Ensure API availability
        api.call("system", "greet")

        api.call(app.dxid, 'addAuthorizedUsers', {"authorizedUsers": [ORG_EVERYONE]})
        api.call(app.dxid, "publish")
        App.transaction do
          app.reload
          app.update!(scope: 'public')
          series = app.app_series
          series_updates = {}
          series_updates[:scope] = 'public' unless series.public?
          series_updates[:latest_version_app_id] = app.id unless series.latest_version_app_id.present? && series.latest_version_app.revision > app.revision
          series.update!(series_updates) if series_updates.present?
        end
      end

      # Jobs
      if jobs.size > 0
        Job.transaction do
          jobs.each do |job|
            job.reload
            job.update!(scope: 'public')
          end
        end
      end

      # Notes
      if notes.size > 0
        Note.transaction do
          notes.each do |note|
            note.reload
            note.update!(scope: 'public')
          end
        end
      end

      flash[:success] = "Your #{uids.size > 1 ? 'items have' : 'item has'} been published."
      redirect_to pathify(item_from_uid(id))
      return
    end

    item = item_from_uid(id)
    if !item.editable_by?(@context)
      flash[:error] = "This item is not owned by you"
      redirect_to :back
      return
    end
    if item.public?
      flash[:error] = "This item is already public"
      redirect_to pathify(item)
      return
    end
    if !item.publishable_by?(@context)
      flash[:error] = "This item cannot be published in this state."
      redirect_to pathify(item)
      return
    end

    graph = get_graph(item)
    js graph: slice_node(graph)
  end

  def history
    id = params[:id]
    raise "Missing id in history route" unless id.is_a?(String) && id.present?
    item = item_from_uid(id)
    if !item.accessible_by?(@context)
      flash[:error] = "This item is not accessible by you"
      redirect_to :back
      return
    end
    @graph = get_graph(item)
  end

  def tokify
    context = @context.as_json
    context["expiration"] = [context["expiration"], Time.now.to_i + 1.day].min
    @key = rails_encryptor.encrypt_and_sign({context: context}.to_json)
  end

  private

  def get_graph(root)
    klass = root.klass
    if klass == "asset"
      klass = "file"
    end
    self.send("get_subgraph_of_#{klass}", root)
  end

  def get_subgraph_of_job(job)
    if job.accessible_by?(@context)
      return [job, [get_subgraph_of_app(job.app)] + job.input_files.map { |file| get_subgraph_of_file(file) }]
    else
      return [job, []]
    end
  end

  def get_subgraph_of_app(app)
    if app.accessible_by?(@context)
      return [app, app.assets.map { |asset| get_subgraph_of_file(asset) }]
    else
      return [app, []]
    end
  end

  def get_subgraph_of_file(file)
    if file.accessible_by?(@context)
      if file.parent_type == "Job"
        return [file, [get_subgraph_of_job(file.parent)]]
      elsif file.parent_type == "Comparison"
        return [file, [get_subgraph_of_job(file.parent)]]
      else #Asset or user-uploaded file
        return [file, []]
      end
    else
      return [file, []]
    end
  end

  def get_subgraph_of_comparison(comparison)
    if comparison.accessible_by?(@context)
      return [comparison, comparison.user_files.map { |file| get_subgraph_of_file(file) }]
    else
      return [comparison, []]
    end
  end

  def get_subgraph_of_note(note)
    if note.accessible_by?(@context)
      return [note, note.attachments.map { |attachment|
        self.send("get_subgraph_of_#{attachment.item_type.downcase.sub(/^user/, '')}", attachment.item)
      }]
    else
      return [note, []]
    end
  end

  def slice_node(node)
    children = node[1]
    if children.length > 0
      children = children.map {|child| slice_node(child)}
    end
    node_sliced = node[0].slice(:uid, :user_id, :title, :scope)
    node_sliced[:owned] = node_sliced[:user_id] == @context.user_id
    node_sliced[:class] = node[0].class.name.demodulize
    # node_sliced[:path] = node[0].path
    return [node_sliced, children]
  end


end
