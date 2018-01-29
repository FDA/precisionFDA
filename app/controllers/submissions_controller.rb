class SubmissionsController < ApplicationController
  skip_before_action :require_login, {only: []}
  before_action :require_login_or_guest, only: []

  def new
    @challenge = Challenge.find_by_id!(params[:challenge_id])
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

    unless @app
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    licenses_to_accept = []
    @app.assets.each do |asset|
      if asset.license.present? && !asset.licensed_by?(@context)
        licenses_to_accept << {
          license: describe_for_api(asset.license),
          user_license: asset.user_license(@context)
        }
      end
    end

    licenses_accepted = @context.user.accepted_licenses.map{|l| {id: l.license_id, pending: l.pending?, active: l.active?, unset: !l.pending? && !l.active?}}

    js challenge_id: params[:challenge_id], app: @app.slice(:dxid, :spec, :title), licenses_to_accept: licenses_to_accept.uniq { |l| l.id}, licenses_accepted: licenses_accepted
  end

  def edit
    @submission = Submission.editable_by(@context).find(params[:id])
    if @submission.nil?
      flash[:error] = "Sorry, this submission does not exist or its log is not accessible by you"
      redirect_to challenge_path(params[:challenge_id])
      return
    end

    js submission: @submission, name: @submission.name
  end

  def create
    if params[:submission] && params[:submission][:inputs]
      submission_inputs = JSON.parse(params[:submission][:inputs])
    else
      raise "Submission parameters not found in submission#create params."
    end

    challenge = Challenge.find(params[:challenge_id])
    raise "Challenge ID not found in submission#create params." unless challenge

    input_info = input_spec_preparer.run(challenge.app, submission_inputs)

    unless input_spec_preparer.valid?
      input_spec_preparer.errors.each do |error_message|
        flash[:error] = error_message
      end
      return
    end

    scope = "public"
    items = input_info.uniq_files

    unless items.all? { |item| item.editable_by?(@context) }
      flash[:error] = "Item is not owned by you."
      redirect_to :back
      return
    end

    if items.all?(&:public?)
      flash[:warning] = "All input files are already public." unless items.empty?
      run_job_create_submission(params)
      redirect_to show_challenge_path(params[:challenge_id], "my_entries")
      return
    end

    not_public_items = items.reject(&:public?)

    unless not_public_items.all? { |item| item.publishable_by?(@context, scope) }
      flash[:error] = "Item cannot be published in this state."
      redirect_to pathify(item)
      return
    end

    js graph: graph_decorator.for_publisher(not_public_items, scope),
       space: nil,
       scope_to_publish_to: scope,
       params: params
  end

  def publish
    sub_params = JSON.parse(params[:sub_params])
    if sub_params["submission"].nil? || sub_params["challenge_id"].nil?
      raise "Submission parameters not available."
    end

    id = params[:id]
    raise "Missing id in publish route" unless id.is_a?(String) && id.present?
    scope = "public"

    # Only applicable after selections have been made
    if params[:uids]
      uids = params[:uids]
      raise "The object 'uids' must be a hash of object ids (strings) with value 'on'." unless uids.is_a?(Hash) && uids.all? { |uid, checked| uid.is_a?(String) && checked == "on" }

      items = ([id] + uids.keys).uniq.map { |uid| item_from_uid(uid) }.reject { |item| item.public? || item.scope == scope }
      raise "Unpublishable items detected" unless items.all? { |item| item.publishable_by?(@context, scope) }

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
      if files.size > 0
        published_count += UserFile.publish(files, @context, scope)
      end

      # Comparisons
      if comparisons.size > 0
        published_count += Comparison.publish(comparisons, @context, scope)
      end

      # Apps
      if apps.size > 0
        published_count += AppSeries.publish(apps, @context, scope)
      end

      # Jobs
      if jobs.size > 0
        published_count += Job.publish(jobs, @context, scope)
      end

      # Notes
      if notes.size > 0
        published_count += Note.publish(notes, @context, scope)
      end

      # Discussions
      if discussions.size > 0
        published_count += Discussion.publish(discussions, @context, scope)
      end

      # Answers
      if answers.size > 0
        published_count += Answer.publish(answers, @context, scope)
      end

      message = "#{published_count}"
      if published_count != items.count
        message += " (out of #{items.count})"
      end
      if published_count == 1
        message += " item has been published."
      else
        message += " items have been published."
      end
      flash[:success] = message
      run_job_create_submission(sub_params)
      redirect_to show_challenge_path(params[:challenge_id], 'my_entries')
      return
    end
  end

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
  def run_job_create_submission(params)
    # Parameter 'id' should be of type String
    # Get challenge
    challenge = Challenge.find_by(id: params["challenge_id"])
    raise "No associated challenge found" unless challenge

    submission = params["submission"]
    raise "No submission info found" unless submission

    # Name should be a nonempty string
    name = submission["name"]
    raise "Name should be a non-empty string" unless name.is_a?(String) && name != ""

    # Name should be a nonempty string
    desc = submission["desc"]
    raise "Description should not be empty" unless desc.present?

    # Inputs should be a hash (more checks later)
    inputs = JSON.parse(submission["inputs"])
    raise "Inputs should be a hash" unless inputs.is_a?(Hash)

    # TODO: Does challengebot need to worry about licenses?
    # Check if asset licenses have been accepted
    # raise "Asset licenses must be accepted" unless @app.assets.all? { |a| !a.license.present? || a.licensed_by?(@context) }

    @app = App.find(challenge.app_id)

    input_info = input_spec_preparer.run(@app, inputs)

    job = job_creator.create(
      app: @app,
      name: name,
      input_info: input_info
    )

    submission = Submission.create!(
      job_id: job.id,
      desc: desc,
      user_id: @context.user_id,
      challenge_id: challenge.id,
      _inputs: input_info.file_dxids
    )

    Event::SubmissionCreated.create(submission, @context.user)

    flash[:success] = "Your entry was submitted successfully."
  end

  def log
    @submission = Submission.editable_by(@context).find(params[:id])
    if @submission.nil?
      flash[:error] = "Sorry, this submission does not exist or its log is not accessible by you"
      redirect_to challenges_path
      return
    end
    if !@submission.job.terminal?
      User.sync_challenge_jobs!
      @submission.job.reload
    end

    @job = @submission.job

    uri = URI(DNANEXUS_APISERVER_URI)

    raw_socket = TCPSocket.new(uri.host, uri.port)
    socket = OpenSSL::SSL::SSLSocket.new(raw_socket)
    socket.connect
    handshake = WebSocket::Handshake::Client.new(url: "wss://#{uri.host}:#{uri.port}/#{@submission.job.dxid}/getLog/websocket")
    socket.write(handshake.to_s)

    while !handshake.finished?
      handshake << socket.readline
    end
    raise unless handshake.valid?
    frame = WebSocket::Frame::Outgoing::Server.new(version: handshake.version, data: {access_token: CHALLENGE_BOT_TOKEN, token_type: "Bearer", tail: false}.to_json, type: :text).to_s
    socket.write(frame)

    srv = WebSocket::Frame::Incoming::Server.new(version: handshake.version)

    @log_times = []
    @log_levels = []
    @log_contents = []
    while true do
      data = socket.getc
      break if data.nil? || data.empty?
      srv << data
      while (msg = srv.next) do
        msg = JSON.parse(msg.to_s)
        # source, msg, timestamp, level, job, line|
        # source=SYSTEM, msg=END_LOG
        raise if msg["code"]
        return if msg["source"] == "SYSTEM" && msg["msg"] == "END_LOG"
        @log_times << msg["timestamp"]
        @log_levels << msg["level"]
        @log_contents << msg["msg"]
      end
    end
  end

  private

  def input_spec_preparer
    @input_spec_preparer ||= InputSpecPreparer.new(@context)
  end

  def graph_decorator
    @graph_decorator ||= GraphDecorator.new(@context)
  end

  def job_creator
    @job_creator ||= JobCreator.new(
      api: DNAnexusAPI.new(CHALLENGE_BOT_TOKEN),
      context: @context,
      user: challenge_bot,
      project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT
    )
  end

  def challenge_bot
    @challenge_bot ||= User.find_by(dxuser: CHALLENGE_BOT_DX_USER)
  end

end
