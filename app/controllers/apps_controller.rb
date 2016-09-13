class AppsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show, :fork, :new]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show, :fork, :new]

  def index
    if @context.guest?
      redirect_to explore_apps_path
      return
    end

    js_param = {}
    @app = nil
    if params[:id].present?
      @app = App.accessible_by(@context).find_by(dxid: params[:id])
      if @app.nil?
        flash[:error] = "Sorry, this app does not exist or is not accessible by you"
        redirect_to apps_path
        return
      else
        @items_from_params = [@app]
        @item_path = pathify(@app)
        @item_comments_path = pathify_comments(@app)
        @comments = @app.root_comments.order(id: :desc).page params[:comments_page]

        @revisions = @app.app_series.accessible_revisions(@context).select(:title, :id, :dxid, :revision, :version)
        @notes = @app.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
        @answers = @app.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
        @discussions = @app.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]
      end
      js_param[:app] = @app.slice(:id, :dxid, :readme)
    end

    @my_apps = AppSeries.editable_by(@context).order(name: :asc).map { |s| s.latest_accessible(@context) }.reject(&:nil?)

    @ran_apps = AppSeries.accessible_by(@context).order(name: :asc).where.not(user_id: @context.user_id).joins(:jobs).distinct.where(:jobs => { :user_id => @context.user_id }).map { |s| s.latest_accessible(@context) }.reject(&:nil?)


    User.sync_jobs!(@context)
    if @app.present?
      jobs = @app.app_series.jobs.editable_by(@context)
    else
      jobs = Job.editable_by(@context)
    end
    @jobs_grid = initialize_grid(jobs, {
      name: 'jobs',
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })
    js js_param
  end

  def export

    # App should exist and be accessible
    @app = App.accessible_by(@context).find_by!(dxid: params[:id])

    # Assets should be accessible and licenses accepted
    assets = Asset.closed.accessible_by(@context);
    fail "Assets must be editable" unless @app.assets.all? { |a| assets.include? a }
    fail "Asset licenses must be accepted" unless @app.assets.all? { |a| !a.license.present? || a.licensed_by?(@context) }

    # Generate download URLs and Docker commands for each asset
    asset_cmds = ""
    @app.assets.each do |asset|
      url = DNAnexusAPI.new(@context.token).call(asset.dxid, "download", {filename: asset.name, project: asset.project, preauthenticated: true})["url"]
      asset_cmds << "RUN curl " + url + " | tar xz -C / --no-same-owner --no-same-permissions\n"
    end

    # Generate Docker command for installing apt-packages
    package_cmd = if (@app.packages.nil?) then "" else "RUN apt-get install --yes " + @app.packages.join(" ") end

    # Generate new token for pfda uploader
    context = @context.as_json.slice("user_id", "username", "token", "expiration", "org_id")
    context["expiration"] = [context["expiration"], Time.now.to_i + 1.day].min
    @key = rails_encryptor.encrypt_and_sign({context: context}.to_json)

    # Generate Docker command for downloading latest pfda uploader
    pfda_uploader_cmd = "RUN curl -o /usr/bin/pfda https://dl.dnanex.us/F/D/X7X4y8Bz2QyB3vfFqQ7qqJVzVz4G44JgV1j2by1J/pfda-1.0.4.tar.gz"

    # Generate Dockerfile string
    dockerfile =
    [
      "FROM precisionfda:ub14",
      package_cmd,
      asset_cmds,
      pfda_uploader_cmd,
      "CMD [\"/usr/bin/run\"]"
    ].join("\n").gsub(/^$\n/, '') # Join with newlines, remove empty lines

    # Download Dockerfile
    send_data dockerfile, :filename => 'Dockerfile'
  end

  def featured
    org = Org.featured
    if org
      @apps_grid = initialize_grid(AppSeries.accessible_by_public.joins(:user).where(:users => { :org_id => org.id }), {
        name: 'apps',
        order: 'apps.created_at',
        order_direction: 'desc',
        per_page: 100,
        include: [{user: :org}, :latest_version_app]
      })
    end
    render :list
  end

  def explore
    @apps_grid = initialize_grid(AppSeries.accessible_by_public.joins(:latest_version_app), {
      name: 'apps',
      order: 'apps.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [{user: :org}, :latest_version_app]
    })
    render :list
  end

  def show
    @app = App.accessible_by(@context).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    @revisions = @app.app_series.accessible_revisions(@context).select(:title, :id, :dxid, :revision, :version)
    @notes = @app.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @app.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @app.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]

    @items_from_params = [@app]
    @item_path = pathify(@app)
    @item_comments_path = pathify_comments(@app)
    @comments = @app.root_comments.order(id: :desc).page params[:comments_page]

    User.sync_jobs!(@context)

    jobs = @app.app_series.jobs.editable_by(@context)
    @jobs_grid = initialize_grid(jobs, {
      name: 'jobs',
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })

    js app: @app.slice(:id, :dxid, :readme)
  end

  def edit
    @app = App.editable_by(@context).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    else
      if @app.id != @app.app_series.latest_revision_app_id
        redirect_to edit_app_path(@app.app_series.latest_revision_app.dxid)
        return
      else
        js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
      end
    end
  end

  def new
  end

  def fork
    @app = App.accessible_by(@context).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, you do not have permissions to fork this app"
      redirect_to apps_path
      return
    else
      js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
    end
  end
end
