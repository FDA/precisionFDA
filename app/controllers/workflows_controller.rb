class WorkflowsController < ApplicationController

  before_action :validate_workflow_before_export, only: %i(cwl_export wdl_export)

  def new
    app_series = AppSeries.accessible_by(@context).joins(:apps).merge(App.accessible_by(@context)).distinct
    private_app_series = app_series.where(scope: "private")
    public_app_series = app_series.where(scope: "public")
    js apps: {private_apps: private_app_series.map { |app_series| app_series.slice(:id, :name) }, public_apps: public_app_series.map { |app_series| app_series.slice(:id, :name) }}
  end

  def show
    @workflow = Workflow.accessible_by(@context).find_by(dxid: params[:id])
    if @workflow.nil?
      flash[:error] = "Sorry, this workflow does not exist or is not accessible by you"
      redirect_to workflows_path
      return
    end

    @revisions = @workflow.workflow_series.accessible_revisions(@context).select(:title, :id, :dxid, :revision)

    User.sync_jobs!(@context)
    analyses = @workflow.analyses.editable_by(@context).includes(jobs: :app)
    @analyses_grid = initialize_grid(analyses, {
      name: 'analyses',
      order: 'analyses.id',
      order_direction: 'desc',
      per_page: 100
    })

    js analyses_jobs: Analysis.job_hash(analyses), workflow: @workflow.slice(:id, :dxid, :readme, :spec)
  end

  def edit
    @workflow = Workflow.editable_by(@context).find_by(dxid: params[:id])
    if @workflow.nil?
      flash[:error] = "Sorry, you do not have permissions to edit this workflow"
      redirect_to workflows_path
      return
    end
    app_series = AppSeries.accessible_by(@context).joins(:apps).merge(App.accessible_by(@context)).distinct
    private_app_series = app_series.where(scope: "private")
    public_app_series = app_series.where(scope: "public")
    js apps: {private_apps: private_app_series.map { |app_series| app_series.slice(:id, :name) }, public_apps: public_app_series.map { |app_series| app_series.slice(:id, :name) }}, workflow: @workflow
  end

  def index
    js_param = {}
    @workflow = nil
    if params[:id].present?
      @workflow = Workflow.accessible_by(@context).find_by(dxid: params[:id])
      if @workflow.nil?
        flash[:error] = "Sorry, this workflow does not exist or is not accessible by you"
        redirect_to workflows_path
        return
      else
        @revisions = @workflow.workflow_series.accessible_revisions(@context).select(:title, :id, :dxid, :revision)
      end
      js_param[:workflow] = @workflow.slice(:id, :dxid, :readme, :spec)
    end

    User.sync_jobs!(@context)
    if @workflow.present?
      analyses = @workflow.analyses.editable_by(@context).includes(jobs: :app)
      js_param[:analyses_jobs] = Analysis.job_hash(analyses)
    else
      analyses = Analysis.editable_by(@context).includes({jobs: :app}, :workflow)
      js_param[:analyses_jobs] = Analysis.job_hash(analyses, workflow_details: true)
    end
    @analyses_grid = initialize_grid(analyses, {
      name: 'analyses',
      order: 'analyses.id',
      order_direction: 'desc',
      per_page: 100
    })

    @my_workflows = WorkflowSeries.editable_by(@context).order(name: :asc).map { |s| s.latest_accessible(@context) }.reject(&:nil?)

    js js_param
  end

  def fork
    @workflow = Workflow.accessible_by(@context).find_by(dxid: params[:id])
    if @workflow.nil?
      flash[:error] = "Sorry, you do not have permissions to fork this workflow"
      redirect_to workflows_path
      return
    end
    app_series = AppSeries.accessible_by(@context).joins(:apps).merge(App.accessible_by(@context)).distinct
    private_app_series = app_series.where(scope: "private")
    public_app_series = app_series.where(scope: "public")
    js apps: {private_apps: private_app_series.map { |app_series| app_series.slice(:id, :name) }, public_apps: public_app_series.map { |app_series| app_series.slice(:id, :name) }}, workflow: @workflow
  end

  def cwl_export
    send_data cwl_exporter.workflow_export(@workflow), :filename => "#{@workflow.name}.tar.gz"
  end

  def wdl_export
    send_data wdl_exporter.workflow_export(@workflow), :filename => "#{@workflow.name}.tar.gz"
  end

  private

  def cwl_exporter
    @cwl_exporter ||= CwlExporter.new(@context.token)
  end

  def wdl_exporter
    @wdl_exporter ||= WdlExporter.new(@context.token)
  end

  def validate_workflow_before_export
    # App should exist and be accessible
    @workflow = Workflow.accessible_by(@context).find_by!(dxid: params[:id])

    # Assets should be accessible and licenses accepted
    @workflow.apps.each do |app|
      if app.assets.accessible_by(@context).count != app.assets.count
        flash[:error] = "This app cannot be exported because one or more assets are not accessible by the current user."
        redirect_to app_path(app.dxid)
      elsif app.assets.any? { |a| a.license.present? && !a.licensed_by?(@context) }
        flash[:error] = "This app contains one or more assets which need to be licensed. Please run the app first in order to accept the licenses."
        redirect_to app_path(app.dxid)
      end
    end
  end

end
