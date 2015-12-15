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
        @revisions = @app.app_series.accessible_revisions(@context).select(:title, :id, :dxid, :revision, :version)
        @notes = @app.notes.accessible_by(@context).order(id: :desc)
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
    @notes = @app.notes.accessible_by(@context).order(id: :desc)

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
