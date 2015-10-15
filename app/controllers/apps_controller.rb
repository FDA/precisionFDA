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

    @apps = App.accessible_by(@context.user_id, @context.org_id).where(is_latest: true, is_applet: false)

    @apps_toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add App", link: new_app_path}
      ]
    }

    User.sync_jobs!(@context.user_id, @context.token)
    if @app.present?
      @jobs_toolbar = {
        fixed: [
          {icon: "fa fa-cube fa-fw", label: "View App", link: app_path(@app.dxid)},
          {icon: "fa fa-bolt fa-fw", label: "Run App", link: new_app_job_path(@app.dxid)}
        ]
      }

      jobs = Job.where(user_id: @context.user_id, series: @app.series)
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
    end
  end
end
