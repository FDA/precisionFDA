class AppsController < ApplicationController
  def index
    js_param = {}
    @app = nil
    if params[:id].present?
      @app = App.accessible_by(@context).find_by(dxid: params[:id])
      if @app.nil?
        flash[:error] = "Sorry, this app does not exist or is not accessible by you"
        redirect_to apps_path
        return
      else
        if @app.user_id == @context.user_id
          @revisions = App.accessible_by(@context).where(app_series_id: @app.app_series_id).order(revision: :desc)
          @latestRevision = @revisions.select { |app| app.id == @app.app_series.latest_revision_app_id}.first
          js_param[:releaseable] = true
        else
          @revisions = App.accessible_by(@context).released.where(app_series_id: @app.app_series_id).order(revision: :desc)
        end

        @notes_grid = initialize_grid(@app.notes.accessible_by(@context), {
          order: 'notes.id',
          order_direction: 'desc',
          per_page: 10
        })
      end
      js_param[:app] = @app.slice(:id, :dxid)
    end

    series = AppSeries.accessible_by(@context)
    @apps = series.map { |s| s.user_id == @context.user_id ? s.latest_revision_app : s.latest_version_app }.reject(&:nil?)

    User.sync_jobs!(@context.user_id, @context.token)
    if @app.present?
      jobs = Job.where(user_id: @context.user_id, app_series_id: @app.app_series_id)
    else
      jobs = Job.where(user_id: @context.user_id)
    end
    @jobs_grid = initialize_grid(jobs, {
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })

    js js_param
  end

  def show
    js_param = {}
    @app = App.accessible_by(@context).find_by(dxid: params[:id])

    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    else
      if @app.user_id == @context.user_id
        @revisions = App.accessible_by(@context).where(app_series_id: @app.app_series_id).order(revision: :desc)
        @latestRevision = @revisions.select { |app| app.id == @app.app_series.latest_revision_app_id}.first
        js_param[:releaseable] = true
      else
        @revisions = App.accessible_by(@context).released.where(app_series_id: @app.app_series_id).order(revision: :desc)
      end
    end

    @notes_grid = initialize_grid(@app.notes.accessible_by(@context), {
      order: 'notes.id',
      order_direction: 'desc',
      per_page: 10
    })

    js_param[:app] = @app.slice(:id, :dxid)
    js js_param
  end

  def edit
    @app = App.editable_by(@context).find_by(dxid: params[:id])
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
