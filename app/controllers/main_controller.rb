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
      AUDIT_LOGGER.info("Access requested: #{p.to_json}")
      Invitation.transaction do
        @invitation = Invitation.create(p)
        if @invitation.persisted?
          NotificationsMailer.invitation_email(@invitation).deliver_now!
        end
      end
    end
  end

  def publish
    id = params[:id]
    raise "Missing id in publish route" unless id.is_a?(String) && id.present?
    @graph = get_graph(id, true)
    if params[:uids]
      uids = params[:uids]
      raise "The object 'uids' must be a hash of object ids (strings) with value 'on'." unless uids.is_a?(Hash) && uids.all? { |uid, checked| uid.is_a?(String) && checked == "on" }

      #TODO: Iterate through uids and publish them, then redirect to 'id' with a success alert
    end
    js graph: slice_node(@graph)
  end

  def history
    id = params[:id]
    raise "Missing id in history route" unless id.is_a?(String) && id.present?
    @graph = get_graph(id, false)
  end

  def tokify
    context = @context.as_json
    context["expiration"] = [context["expiration"], Time.now.to_i + 1.day].min
    @key = rails_encryptor.encrypt_and_sign({context: context}.to_json)
  end

  private

  def get_graph(id, perform_check)
    if id =~ /^(job|app|file)-(.{24})$/
      klass = {
        "job" => Job,
        "app" => App,
        "file" => UserFile
      }[$1]
      record = klass.accessible_by(@context).find_by!(dxid: id)
      if perform_check && !record.publishable_by?(@context)
        # may happen if job is not done or file is not closed
        flash[:error] = "This item cannot be published in this state."
        redirect_to pathify(record)
        return
      end
      graph = self.send("publish_#{$1}", record)
    elsif id =~ /^comparison-(\d+)$/
      # Transitional until comparisons get real dxids
      id = $1.to_i
      comparison = Comparison.find_by!(id: id, user_id: @context.user_id)
      if perform_check && !comparison.publishable_by?(@context)
        # may happen if comparison is not done
        flash[:error] = "This comparison cannot be published in this state."
        redirect_to pathify(comparison)
        return
      end
      graph = publish_comparison(comparison)
    elsif id =~ /^note-(\d+)$/
      id = $1.to_i
      note = Note.find_by!(id: id, user_id: @context.user_id)
      if perform_check && !note.publishable_by?(@context)
        # should never happen
        flash[:error] = "This note cannot be published in this state."
        redirect_to pathify(note)
        return
      end
      graph = publish_note(note)
    else
      raise "Invalid id '#{id}' in get_graph"
    end
    return graph
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

  def publish_job(job)
    if job.accessible_by?(@context)
      return [job, [publish_app(job.app)] + job.input_files.map { |file| publish_file(file) }]
    else
      return [job, []]
    end
  end

  def publish_app(app)
    if app.accessible_by?(@context)
      return [app, app.assets.map { |asset| publish_file(asset) }]
    else
      return [app, []]
    end
  end

  def publish_file(file)
    raise "Unpublishable file '#{file.uid}'" if file.parent_type == "Comparison"
    if file.accessible_by?(@context) && file.parent_type == "Job"
      return [file, [publish_job(file.parent)]]
    else
      return [file, []]
    end
  end

  def publish_comparison(comparison)
    if comparison.accessible_by?(@context)
      return [comparison, comparison.user_files.map { |file| publish_file(file) }]
    else
      return [comparison, []]
    end
  end

  def publish_note(note)
    if note.accessible_by?(@context)
      return [note, note.attachments.map { |attachment|
        self.send("publish_#{attachment.item_type.downcase.sub(/^user/, '')}", attachment.item)
      }]
    else
      return [note, []]
    end
  end

end
