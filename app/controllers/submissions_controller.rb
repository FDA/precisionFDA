class SubmissionsController < ApplicationController
  skip_before_action :require_login, {only: []}
  before_action :require_login_or_guest, only: []

  def new
    @submission = Submission.new
    @challenge = Challenge.find_by_id!(params[:challenge_id])
    @app = @challenge.app

    if @app.nil?
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
    submission_inputs = nil
    if params[:submission] && params[:submission][:inputs]
      submission_inputs = JSON.parse(params[:submission][:inputs])
    else
      raise "Submission parameters not found in submission#create params."
    end

    challenge = Challenge.find(params[:challenge_id])
    if challenge.nil?
      raise "Challenge ID not found in submission#create params."
    end

    # Publishing wizard only takes a single top-level element to publish, so grab the first file
    first_file = challenge.app.input_spec.select{|input| input["class"]=="file"}.first
    if !submission_inputs.has_key?(first_file[:name])
      raise "Submission inputs do not match Challenge App Spec."
    end

    id = submission_inputs["#{first_file[:name]}"]
    scope = "public"
    item = item_from_uid(id)
    if !item.editable_by?(@context)
      flash[:error] = "This item is not owned by you."
      redirect_to :back
      return
    end
    if item.public?
      flash[:warning] = "All input files are already public."
      run_job_create_submission(params)
      redirect_to show_challenge_path(params[:challenge_id], 'my_entries')
      return
    end
    if !item.publishable_by?(@context, scope)
      flash[:error] = "This item cannot be published in this state."
      redirect_to pathify(item)
      return
    end

    graph = get_graph(item)

    js graph: publisher_js_prepare(graph, scope), space: nil, scope_to_publish_to: scope, params: params
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
    #
    # Check if asset licenses have been accepted
    # raise "Asset licenses must be accepted" unless @app.assets.all? { |a| !a.license.present? || a.licensed_by?(@context) }

    # Inputs should be compatible
    # (The following also normalizes them)
    run_inputs = {}
    dx_run_input = {}
    input_file_dxids = []
    @app = App.find(challenge.app_id)
    @app.input_spec.each do |input|
      key = input["name"]
      optional = (input["optional"] == true)
      has_default = input.has_key?("default")
      default = input["default"]
      klass = input["class"]
      choices = input["choices"]

      if inputs.has_key?(key)
        value = inputs[key]
      elsif has_default
        value = default
      elsif optional
        # No given value and no default, but input is optional; move on
        next
      else
        # Required input is missing
        raise "#{key}: required input is missing"
      end

      # Check compatibility with choices
      raise "#{key}: incompatiblity with choices" if choices.present? && !choices.include?(value)

      if klass == "file"
        raise "#{key}: input file value is not a string" unless value.is_a?(String)
        file = UserFile.real_files.accessible_by(@context).find_by(dxid: value)
        raise "#{key}: input file is not accessible or does not exist" unless !file.nil?
        raise "#{key}: input file's license must be accepted" unless !file.license.present? || file.licensed_by?(@context)

        dxvalue = {"$dnanexus_link" => value}
        input_file_dxids << value
      elsif klass == "int"
        raise "#{key}: value is not an integer" unless value.is_a?(Numeric) && (value.to_i == value)
        value = value.to_i
      elsif klass == "float"
        raise "#{key}: value is not a float" unless value.is_a?(Numeric)
      elsif klass == "boolean"
        raise "#{key}: value is not a boolean" unless value == true || value == false
      elsif klass == "string"
        raise "#{key}: value is not a string" unless value.is_a?(String)
      end

      run_inputs[key] = value
      dx_run_input[key] = dxvalue || value
    end

    challenge_bot = User.find_by(dxuser: CHALLENGE_BOT_DX_USER)
    project = challenge_bot.private_files_project

    api_input = {
      name: name,
      input: dx_run_input,
      project: project,
      timeoutPolicyByExecutable: {@app.dxid => {"*" => {"days" => 2}}}
    }

    # Run the app
    jobid = DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).call(@app.dxid, "run", api_input)["id"]

    # Create job record
    opts = {
      dxid: jobid,
      app_series_id: @app.app_series_id,
      app_id: @app.id,
      project: project,
      run_inputs: run_inputs,
      state: "idle",
      name: name,
      describe: {},
      scope: "private",
      user_id: challenge_bot.id
    }

    provenance = {jobid => {app_dxid: @app.dxid, app_id: @app.id, inputs: run_inputs}}
    input_file_dxids.uniq!
    input_file_ids = []
    UserFile.accessible_by(@context).where(dxid: input_file_dxids).find_each do |file|
      if file.parent_type == "Job"
        parent_job = file.parent
        provenance.merge!(parent_job.provenance)
        provenance[file.dxid] = parent_job.dxid
      end
      input_file_ids << file.id
    end
    opts[:provenance] = provenance

    job = nil
    Job.transaction do
      job = Job.create!(opts)
      job.input_file_ids = input_file_ids
      job.save!
    end

    # create submission record
    published_count = 0
    if job
      opts = {
        job_id: job.id,
        desc: desc,
        user_id: @context.user_id,
        challenge_id: challenge.id,
        _inputs: input_file_dxids
      }
      Submission.transaction do
        submission = Submission.create!(opts)
      end
    end

    msg = "Your entry was submitted successfully."
    if published_count == 1
      msg += " #{published_count} item has been published."
    elsif published_count > 1
      msg += " #{published_count} items have been published."
    end
    flash[:success] = msg
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

  def get_graph(root)
    klass = root.klass
    if klass == "asset"
      klass = "file"
    elsif klass == "answer"
      klass = "note"
    elsif klass == "discussion"
      klass = "note"
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
        return [file, [get_subgraph_of_comparison(file.parent)]]
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

  def publisher_js_prepare(node, scope = 'public')
    item = node[0].slice(:uid, :klass)
    item[:title] = node[0].accessible_by?(@context) ? node[0].title : node[0].uid
    item[:owned] = node[0].editable_by?(@context)
    item[:public] = node[0].public?
    item[:in_space] = node[0].in_space?
    item[:publishable] = node[0].publishable_by?(@context, scope)

    children = node[1].map { |child| publisher_js_prepare(child, scope) }

    return [item, children]
  end
end
