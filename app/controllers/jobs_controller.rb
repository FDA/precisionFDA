class JobsController < ApplicationController
  skip_before_action :require_login,     only: [:show]
  before_action :require_login_or_guest, only: [:show]

  def show
    @job = Job.accessible_by(@context).includes(:user).find_by_uid(unsafe_params[:id])

    if @job.nil?
      flash[:error] = "Sorry, this job does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    sync_job!

    @items_from_params = [@job]
    @item_path = pathify(@job)
    @item_comments_path = pathify_comments(@job)
    if @job.in_space?
      space = item_from_uid(@job.scope)
      @comments = Comment.where(commentable: space, content_object: @job).order(id: :desc).page unsafe_params[:comments_page]
    else
      @comments = @job.root_comments.order(id: :desc).page unsafe_params[:comments_page]
    end

    @notes = @job.notes.real_notes.accessible_by(@context).order(id: :desc).page unsafe_params[:notes_page]
    @answers = @job.notes.accessible_by(@context).answers.order(id: :desc).page unsafe_params[:answers_page]
    @discussions = @job.notes.accessible_by(@context).discussions.order(id: :desc).page unsafe_params[:discussions_page]
    js id: @job.id, desc: @job.from_submission? ? @job.submission.desc : ""
  end

  def log
    @job = Job.accessible_by(@context).find_by_uid(unsafe_params[:id])

    if @job.nil? || @job.log_unaccessible?(@context)
      flash[:error] = "Sorry, this job does not exist or its log is not accessible by you"
      redirect_to apps_path
      return
    end

    sync_job!

    uri = URI(DNANEXUS_APISERVER_URI)
    raw_socket = TCPSocket.new(uri.host, uri.port)
    socket = OpenSSL::SSL::SSLSocket.new(raw_socket)
    socket.connect
    handshake = WebSocket::Handshake::Client.new(url: "wss://#{uri.host}:#{uri.port}/#{@job.dxid}/getLog/websocket")
    socket.write(handshake.to_s)
    handshake << socket.readline until handshake.finished?
    raise unless handshake.valid?

    frame = WebSocket::Frame::Outgoing::Client.new(
      version: handshake.version,
      data: {
        access_token: @job.from_submission? ? CHALLENGE_BOT_TOKEN : @context.token,
        token_type: "Bearer", tail: false
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
      break if data.nil? || data.empty?

      client << data
      while (msg = client.next)
        json = JSON.parse(msg.to_s)
        # source, msg, timestamp, level, job, line|
        # source=SYSTEM, msg=END_LOG

        if json["code"]
          flash[:error] = "Sorry, something went wrong. Please, try later"
          return
        end

        return if json["source"] == "SYSTEM" && json["msg"] == "END_LOG"

        @log_times << json["timestamp"]
        @log_levels << json["level"]
        @log_contents << json["msg"]
      end
    end
  end

  def new
    @app = App.find_by!(uid: unsafe_params[:app_id])

    unless @app.runnable_by?(current_user)
      redirect_back(
        fallback_location: apps_path,
        flash: { error: I18n.t("app_not_accessible_or_runnable") },
      ) && return
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

    licenses_accepted = @context.user.accepted_licenses.map do |license|
      {
        id: license.license_id,
        pending: license.pending?,
        active: license.active?,
        unset: !license.pending? && !license.active?
      }
    end

    available_spaces = @app.available_job_spaces(@context.user)

    selectable_spaces = available_spaces.map do |space|
      { value: space.id, label: space.title, space_type: space.space_type }
    end

    content_scopes = available_spaces.each_with_object({}) do |space, memo|
      memo[space.id] = space.accessible_scopes
    end

    js app: @app.slice(:uid, :spec, :title, :space_scopes),
       licenses_to_accept: licenses_to_accept.uniq(&:id),
       licenses_accepted: licenses_accepted,
       selectable_spaces: selectable_spaces,
       content_scopes: content_scopes
  end

  def destroy
    @job = Job.where(user_id: @context.user_id).find_by_uid(unsafe_params[:id])
    if @job.nil?
      flash[:error] = "Sorry, this job does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end
    if !@job.terminal?
      DNAnexusAPI.new(@context.token).call(@job.dxid, "terminate")
    end
    redirect_to job_path(@job)
  end

  private

  def sync_job!
    return if @job.terminal?

    if @job.from_submission?
      User.sync_challenge_job!(@job.id)
    else
      User.sync_job!(@context, @job.id)
    end
  end
end
