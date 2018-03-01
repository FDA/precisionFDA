class JobsController < ApplicationController
  skip_before_action :require_login,     only: [:show]
  before_action :require_login_or_guest, only: [:show]

  def show
    @job = Job.accessible_by(@context).includes(:user).find_by(dxid: params[:id])

    if @job.nil?
      flash[:error] = "Sorry, this job does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    if !@job.terminal?
      @job.from_submission? ? User.sync_challenge_job!(@job.id) : User.sync_job!(@context, @job.id)
      @job.reload
    end

    @items_from_params = [@job]
    @item_path = pathify(@job)
    @item_comments_path = pathify_comments(@job)
    @comments = @job.root_comments.order(id: :desc).page params[:comments_page]

    @notes = @job.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @job.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @job.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]
    js id: @job.id, desc: @job.from_submission? ? @job.submission.desc : ""
  end

  def log
    @job = Job.accessible_by(@context).find_by(dxid: params[:id])

    if @job.nil?
      flash[:error] = "Sorry, this job does not exist or its log is not accessible by you"
      redirect_to apps_path
      return
    end

    if !@job.terminal?
      @job.from_submission? ? User.sync_challenge_job!(@job.id) : User.sync_job!(@context, @job.id)
      @job.reload
    end

    uri = URI(DNANEXUS_APISERVER_URI)

    raw_socket = TCPSocket.new(uri.host, uri.port)
    socket = OpenSSL::SSL::SSLSocket.new(raw_socket)
    socket.connect
    handshake = WebSocket::Handshake::Client.new(url: "wss://#{uri.host}:#{uri.port}/#{@job.dxid}/getLog/websocket")
    socket.write(handshake.to_s)

    while !handshake.finished?
      handshake << socket.readline
    end
    raise unless handshake.valid?
    frame = WebSocket::Frame::Outgoing::Server.new(version: handshake.version, data: {access_token: @job.from_submission? ? CHALLENGE_BOT_TOKEN : @context.token, token_type: "Bearer", tail: false}.to_json, type: :text).to_s
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

  def new
    @app = App.accessible_by(@context).find_by(dxid: params[:app_id])
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

    js app: @app.slice(:dxid, :spec, :title), licenses_to_accept: licenses_to_accept.uniq { |l| l.id}, licenses_accepted: licenses_accepted
  end

  def destroy
    @job = Job.find_by(user_id: @context.user_id, dxid: params[:id])
    if @job.nil?
      flash[:error] = "Sorry, this job does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end
    if !@job.terminal?
      DNAnexusAPI.new(@context.token).call(@job.dxid, "terminate")
    end
    redirect_to job_path(@job.dxid)
  end
end
