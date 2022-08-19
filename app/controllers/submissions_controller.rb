# Submissions controller
class SubmissionsController < ApplicationController
  include CloudResourcesConcern

  skip_before_action :require_login, only: []
  before_action :require_login_or_guest, only: []
  before_action :check_challenge_access

  def new
    @challenge = Challenge.find(unsafe_params[:challenge_id])

    if @context.logged_in?
      unless @challenge.followed_by?(@context.user)
        flash[:warning] = "Please join the challenge to enter submissions."
        redirect_to challenge_path(@challenge)
        return
      end
    else
      redirect_to challenge_path(@challenge)
      return
    end

    @submission = Submission.new
    @app = @challenge.app

    unless @challenge.accepting_submissions?
      flash[:error] = "Sorry, this challenge is currently not accepting submissions."
      redirect_to challenge_path(@challenge)
      return
    end

    if user_has_no_compute_resources_allowed
      flash[:error] = I18n.t("api.errors.no_allowed_instance_types")
      redirect_to apps_path
      return
    end

    unless @app
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    licenses_to_accept = []
    @app.assets.each do |asset|
      next unless asset.license.present? && !asset.licensed_by?(@context)

      licenses_to_accept << {
        license: describe_for_api(asset.license),
        user_license: asset.user_license(@context),
      }
    end

    licenses_accepted = @context.user.accepted_licenses.map do |l|
      {
        id: l.license_id,
        pending: l.pending?,
        active: l.active?,
        unset: !l.pending? && !l.active?,
      }
    end

    js challenge_id: unsafe_params[:challenge_id],
       app: @app.slice(:dxid, :spec, :title),
       scopes_permitted: %w(public private),
       licenses_to_accept: licenses_to_accept.uniq(&:id),
       licenses_accepted: licenses_accepted,
       instance_types: user_compute_resource_labels
  end

  def edit
    @submission = Submission.editable_by(@context).find(unsafe_params[:id])
    if @submission.nil?
      flash[:error] = "Sorry, this submission does not exist or its log is not accessible by you"
      redirect_to challenge_path(unsafe_params[:challenge_id])
      return
    end

    js submission: @submission, name: @submission.name
  end

  def create
    unless unsafe_params[:submission] && unsafe_params[:submission][:inputs]
      raise "Submission parameters not found in submission#create params."
    end

    submission_inputs = JSON.parse(unsafe_params[:submission][:inputs])

    challenge = Challenge.find(unsafe_params[:challenge_id])
    raise "Challenge ID not found in submission#create params." unless challenge

    input_info = input_spec_preparer.run(challenge.app, submission_inputs)

    unless input_spec_preparer.valid?
      input_spec_preparer.errors.each do |error_message|
        flash[:error] = error_message
      end
      return
    end

    items = input_info.uniq_files

    unless items.all? { |item| item.editable_by?(@context) }
      flash[:error] = "Item is not owned by you."
      redirect_back(fallback_location: root_path) && return
    end

    run_job_create_submission(unsafe_params, input_info)
    redirect_to show_challenge_path(unsafe_params[:challenge_id], "my_entries")
  end

  def publish
    sub_params = JSON.parse(unsafe_params[:sub_params])
    if sub_params["submission"].nil? || sub_params["challenge_id"].nil?
      raise "Submission parameters not available."
    end

    id = unsafe_params[:id]
    raise "Missing id in publish route" unless id.is_a?(String) && id.present?

    scope = "public"

    # Only applicable after selections have been made
    return unless unsafe_params[:uids]

    uids = unsafe_params[:uids]

    unless uids.is_a?(Hash) && uids.all? { |uid, checked| uid.is_a?(String) && checked == "on" }
      raise "The object 'uids' must be a hash of object ids (strings) with value 'on'."
    end

    items = ([id] + uids.keys).uniq.map { |uid| item_from_uid(uid) }
    items = items.reject { |item| item.public? || item.scope == scope }

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

    message = published_count.to_s
    message += " (out of #{items.count})" if published_count != items.count
    message += if published_count == 1
      " item has been published."
    else
      " items have been published."
    end

    flash[:success] = message
    run_job_create_submission(sub_params)

    redirect_to show_challenge_path(unsafe_params[:challenge_id], "my_entries")
  end

  def log
    @submission = Submission.editable_by(@context).find(unsafe_params[:id])
    if @submission.nil?
      flash[:error] = "Sorry, this submission does not exist or its log is not accessible by you"
      redirect_to challenges_path
      return
    end
    unless @submission.job.terminal?
      Job.sync_challenge_jobs!
      @submission.job.reload
    end

    @job = @submission.job

    uri = URI(DNANEXUS_APISERVER_URI)

    raw_socket = TCPSocket.new(uri.host, uri.port)
    socket = OpenSSL::SSL::SSLSocket.new(raw_socket)
    socket.connect
    handshake = WebSocket::Handshake::Client.new(
      url: "wss://#{uri.host}:#{uri.port}/#{@submission.job.dxid}/getLog/websocket",
    )
    socket.write(handshake.to_s)

    handshake << socket.readline until handshake.finished?
    raise unless handshake.valid?

    frame = WebSocket::Frame::Outgoing::Client.new(
      version: handshake.version,
      data: {
        access_token: CHALLENGE_BOT_TOKEN,
        token_type: "Bearer",
        tail: false,
      }.to_json,
      type: :text,
    ).to_s

    socket.write(frame)

    client = WebSocket::Frame::Incoming::Client.new(version: handshake.version)

    @log_times = []
    @log_levels = []
    @log_contents = []
    loop do
      data = socket.getc
      break if data.blank?

      client << data
      while (msg = client.next)
        msg = JSON.parse(msg.to_s)

        raise if msg["code"]
        return if msg["source"] == "SYSTEM" && msg["msg"] == "END_LOG"

        @log_times << msg["timestamp"]
        @log_levels << msg["level"]
        @log_contents << msg["msg"]
      end
    end
  end

  private

  # Inputs
  #
  # id (string, required): the dxid of the app to run
  # name (string, required): the name of the job
  # inputs (hash, required): the inputs
  # instance_type (string, optional): override of the default instance type
  #
  # Outputs
  #
  # id (string): the dxid of the resulting job
  #
  # Run scoring app, create corresponding job and submission record
  # @param opts [Array] - array of UserFile objects to be published.
  # @param input_info [Hash] - a new scope of a file.
  #
  def run_job_create_submission(opts, input_info = nil)
    # Parameter 'id' should be of type String
    # Get challenge
    @challenge = Challenge.find_by(id: opts["challenge_id"])
    raise "No associated challenge found" unless @challenge

    submission = opts["submission"]
    raise "No submission info found" unless submission

    # Name should be a nonempty string
    name = submission["name"]
    raise "Name should be a non-empty string" unless name.is_a?(String) && name != ""

    # Name should be a nonempty string
    desc = submission["desc"]
    raise "Description should not be empty" if desc.blank?

    # Inputs should be a hash (more checks later)
    @inputs = JSON.parse(submission["inputs"])
    raise "Inputs should be a hash" unless @inputs.is_a?(Hash)

    # TODO: Does challengebot need to worry about licenses?
    # Check if asset licenses have been accepted
    # unless @app.assets.all? { |a| !a.license.present? || a.licensed_by?(@context) }
    #   raise "Asset licenses must be accepted"
    # end

    @app = App.find(@challenge.app_id)

    cloned_inputs = clone_inputs_to_space
    job_run_inputs = cloned_inputs.copies.to_h { |copy| [copy.source.uid, copy.object.uid] } unless cloned_inputs.nil?

    input_info ||= input_spec_preparer.run(@app, @inputs)

    input_info.run_inputs.each { |k, v| input_info.run_inputs[k] = job_run_inputs[v] } unless cloned_inputs.nil?

    job = job_creator.create(
      app: @app,
      name: name,
      input_info: input_info,
    )

    submission = Submission.create!(
      job_id: job.id,
      desc: desc,
      user_id: @context.user_id,
      challenge_id: @challenge.id,
      _inputs: input_info.file_dxids,
    )

    job.update!(project: @challenge.space.host_project, scope: @challenge.space.scope)

    Event::SubmissionCreated.create_for(submission, @context.user)

    flash[:success] = "Your entry was submitted successfully."
  end

  def input_spec_preparer
    @input_spec_preparer ||= InputSpecPreparer.new(@context)
  end

  # Clones user's submission files into challenge space.
  def clone_inputs_to_space
    files = UserFile.accessible_by(@context).where(uid: @inputs.values)

    return if files.empty?

    api = DIContainer.resolve("api.user")

    api.project_invite(
      @context.user.private_files_project,
      "user-#{CHALLENGE_BOT_DX_USER}",
      DNAnexusAPI::PROJECT_ACCESS_VIEW,
      suppressEmailNotification: true,
      suppressAllNotifications: true,
    )

    begin
      copied_files = challenge_bot_copy_service.copy(files, @challenge.space.scope)
    ensure
      api.project_decrease_permissions(
        @context.user.private_files_project,
        DNAnexusAPI::PROJECT_ACCESS_NONE,
        "user-#{CHALLENGE_BOT_DX_USER}",
      )
    end
    copied_files
  end

  def challenge_bot_copy_service
    @challenge_bot_copy_service ||= CopyService.new(
      api: DIContainer.resolve("api.challenge_bot"),
      user: User.challenge_bot,
    )
  end

  def job_creator
    @job_creator ||= JobCreator.new(
      api: DIContainer.resolve("api.challenge_bot"),
      context: @context,
      user: User.challenge_bot,
      project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT,
    )
  end

  def check_challenge_access
    return if Challenge.accessible_by(@context).exists?(params[:challenge_id].to_i)

    redirect_to challenges_path, alert: "The challenge is not accessible to you"
  end
end
