class MainController < ApplicationController
  skip_before_action :require_login, {only: [:index, :about, :exception_test, :login, :return_from_login, :request_access]}

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

    if id =~ /^(job|app|file)-(.{24})$/
      klass = {
        "job" => Job,
        "app" => App,
        "file" => UserFile,
        "note" => Note
      }[$1]
      record = klass.find_by!(dxid: id, user_id: @context.user_id)
      @graph = self.send("publish_#{$1}", record)
    elsif id =~ /^comparison-(\d+)$/
      # Transitional until comparisons get real dxids
      id = $1.to_i
      comparison = Comparison.find_by!(id: id, user_id: @context.user_id)
      @graph = publish_comparison(comparison)
    elsif id =~ /^note-(\d+)$/
      id = $1.to_i
      note = Note.find_by!(id: id, user_id: @context.user_id)
      @graph = publish_note(note)
    else
      raise "Invalid id '#{id}' in publish route"
    end

  end

  def tokify
    context = @context.as_json
    context["expiration"] = [context["expiration"], Time.now.to_i + 1.day].min
    @key = rails_encryptor.encrypt_and_sign({context: context}.to_json)
  end

  private

  def publish_job(job)
    if job.user_id != @context.user_id
      return [job, []]
    else
      return [job, [publish_app(job.app)] + job.input_files.map { |file| publish_file(file) }]
    end
  end

  def publish_app(app)
    if app.user_id != @context.user_id
      return [app, []]
    else
      return [app, app.assets.map { |asset| publish_file(asset) }]
    end
  end

  def publish_file(file)
    raise "Unpublishable file" if file.parent_type == "Comparison"
    if file.user_id != @context.user_id || file.parent_type == "User" || file.parent_type == "Asset"
      return [file, []]
    else # File comes from owned job
      return [file, [publish_job(file.parent)]]
    end
  end

  def publish_comparison(comparison)
    if comparison.user_id != @context.user_id
      return [comparison, []]
    else
      return [comparison, comparison.user_files.map { |file| publish_file(file) }]
    end
  end

  def publish_note(note)
    if note.user_id != @context.user_id
      return [note, []]
    else
      return [note, note.attachments.map { |attachment|
        self.send("publish_#{attachment.item_type.downcase.sub(/^user/, '')}", attachment.item)
      }]
    end
  end

end
