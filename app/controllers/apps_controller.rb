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

    if @app.present?
      @jobs_toolbar = {
        fixed: [
          {icon: "fa fa-bolt fa-fw", label: "Run App", link: new_app_job_path(@app.dxid)}
        ]
      }

      @jobs = Job.find_by(user_id: @context.user_id, series: @app.series)

      #TODO Remove the below
      @jobs_list = {
        header: [
          {field: "state", display: "State"},
          {field: "name", display: "Name"},
          {field: "duration", display: "Duration"},
          {field: "created", display: "Created"},
          {field: "addedBy", display: "Launched by"}
        ],
        rows: [
          [
            {field: "state", display: "Running", classes: "state-running"},
            {field: "name", display: "ART whole-genome 150bp", link: "#"},
            {field: "duration", display: "5 min"},
            {field: "created", display: "9/17/2015"},
            {field: "addedBy", display: "george.fdauser", link: "#"}
          ],
          [
            {field: "state", display: "Done", classes: "state-done"},
            {field: "name", display: "ART HiSeq 1000 simulation", link: "#"},
            {field: "duration", display: "20 min"},
            {field: "created", display: "9/16/2015"},
            {field: "addedBy", display: "george.fdauser", link: "#"}
          ],
          [
            {field: "state", display: "Failed", classes: "state-failed"},
            {field: "name", display: "ART HiSeq 1000 simulation", link: "#"},
            {field: "duration", display: "1 min"},
            {field: "created", display: "9/15/2015"},
            {field: "addedBy", display: "george.fdauser", link: "#"}
          ]
        ]
      }
    end
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
