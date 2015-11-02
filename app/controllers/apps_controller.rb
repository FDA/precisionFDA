class AppsController < ApplicationController
  def index
    @app = nil
    if params[:id].present?
      @app = App.accessible_by(@context.user_id, @context.org_id).find_by(dxid: params[:id])
      if @app.nil?
        flash[:error] = "Sorry, this app does not exist or is not accessible by you"
        redirect_to apps_path
        return
      end
    end

    series = AppSeries.accessible_by(@context.user_id, @context.org_id)
    @apps = series.map { |s| s.user_id == @context.user_id ? s.latest_revision_app : s.latest_version_app }.reject(&:nil?)

    User.sync_jobs!(@context.user_id, @context.token)
    if @app.present?
      fixed_actions = []
      fixed_actions.push({icon: "fa fa-cube fa-fw", label: "View App", link: app_path(@app.dxid)})
      fixed_actions.push({icon: "fa fa-edit fa-fw", label: "Edit App", link: edit_app_path(@app.dxid)}) if @app.user_id == @context.user_id
      fixed_actions.push({icon: "fa fa-bolt fa-fw", label: "Run App", link: new_app_job_path(@app.dxid)})

      @jobs_toolbar = {
        fixed: fixed_actions
      }

      jobs = Job.where(user_id: @context.user_id, app_series_id: @app.app_series_id)
    else
      jobs = Job.where(user_id: @context.user_id)
    end
    @jobs_grid = initialize_grid(jobs, {
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })
  end

  def show
    @app = App.accessible_by(@context.user_id, @context.org_id).find_by(dxid: params[:id])

    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return

    else
      if @app.user_id == @context.user_id
        @apps = App.accessible_by(@context.user_id, @context.org_id).where(app_series_id: @app.app_series_id).order(revision: :desc)
        @latestRevision = @apps.select { |app| app.id == @app.app_series.latest_revision_app_id}.first
      else
        @apps = App.accessible_by(@context.user_id, @context.org_id).released.where(app_series_id: @app.app_series_id).order(revision: :desc)
      end
    end
  end

  def edit
    @app = App.editable_by(@context.user_id).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    else
      isLatest = @app.id == @app.app_series.latest_revision_app_id ? true : false
      if !isLatest
        @app = App.find_by(id: @app.app_series.latest_revision_app_id)
        redirect_to edit_app_path(@app.dxid)
        return
      else
        js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
      end
    end
  end

  def new
  end

  def fork
    @app = App.accessible_by(@context.user_id, @context.org_id).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, you do not have permissions to fork this app"
      redirect_to apps_path
      return
    else
      js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
    end
  end
end
