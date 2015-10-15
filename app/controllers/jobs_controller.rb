class JobsController < ApplicationController
  def show
  end

  def new
    # Note that if this was new instead of new2, the params would be :app_id instead of :id
    @app = App.accessible_by(@context.user_id, @context.org_id).find_by(dxid: params[:app_id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end
    @job = Job.new
    @job.app = @app

    js app: @app.slice(:id, :dxid, :series, :spec, :title)
  end

  def new2
    # Note that if this was new instead of new2, the params would be :app_id instead of :id
    @app = App.accessible_by(@context.user_id, @context.org_id).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end
    @job = Job.new
    @job.app = @app
    # Temporary route for a barebones job submission form
    # (Doesn't bother with refreshing state)
    @files = UserFile.real_files.accessible_by(@context.user_id)
  end

  def create
    @app = App.accessible_by(@context.user_id, @context.org_id).find_by(dxid: params[:app_id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    flash[:error] = "Not implemented yet"

    @job = Job.new(name: params[:job][:name], app_id: params[:app_id], run_inputs: params[:job][:run_inputs])
    @job.app = @app

    # Temporary route for a barebones job submission form
    # (Doesn't bother with refreshing state)
    @files = UserFile.real_files.accessible_by(@context.user_id)

    render :new2
  end
end
