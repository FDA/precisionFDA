class WorkflowsController < ApplicationController
  include WorkflowConcern

  before_action :validate_workflow_before_export, only: %i(cwl_export wdl_export)

  rescue_from ApiError, :with => :render_error_method

  def new
    app_series = AppSeries.accessible_by(@context).joins(:apps).merge(App.accessible_by(@context)).distinct
    private_app_series = app_series.where(scope: "private")
    public_app_series = app_series.where(scope: "public")
    js apps: { private_apps: private_app_series.map { |app_series| app_series.slice(:id, :name) }, public_apps: public_app_series.map { |app_series| app_series.slice(:id, :name) } }
  end

  def show


    @workflow = Workflow.accessible_by(@context).find_by_uid(params[:id])
    if @workflow.nil?
      flash[:error] = "Sorry, this workflow does not exist or is not accessible by you"
      redirect_to workflows_path
      return
    end

    comment_data

    @revisions = @workflow.workflow_series.accessible_revisions(@context).select(:title, :id, :dxid, :uid, :revision)

    @workflow.in_space? ? User.sync_jobs!(@context, @workflow.jobs, @workflow.project) : User.sync_jobs!(@context)

    a = Analysis.arel_table
    batch_ids = ActiveRecord::Base.connection.execute("select min(id) from analyses where batch_id is not null group by batch_id").to_a.flatten
    all_analyses = @workflow.analyses.editable_by(@context).includes(jobs: :app).where( a["batch_id"].eq(nil).or(a["id"].in(batch_ids)))

    batch_hash = Analysis.batch_hash(all_analyses.where("batch_id is not NULL"))

    @analyses_grid = initialize_grid(all_analyses,
      name: 'analyses',
      order: 'analyses.id',
      order_direction: 'desc',
      per_page: 100,)

    js analyses_jobs: Analysis.job_hash(all_analyses.where(batch_id: nil)), workflow: @workflow.slice(:id, :dxid, :uid, :readme, :spec), batches: batch_hash
  end

  def edit
    @workflow = Workflow.editable_by(@context).find_by_uid(params[:id])
    if @workflow.nil?
      flash[:error] = "Sorry, you do not have permissions to edit this workflow"
      redirect_to workflows_path
      return
    end
    app_series = AppSeries.accessible_by(@context).joins(:apps).merge(App.accessible_by(@context)).distinct
    private_app_series = app_series.where(scope: "private")
    public_app_series = app_series.where(scope: "public")
    js apps: { private_apps: private_app_series.map { |app_series| app_series.slice(:id, :name) }, public_apps: public_app_series.map { |app_series| app_series.slice(:id, :name) } }, workflow: @workflow
  end

  def index
    js_param = {}
    batch_json = {}
    @workflow = nil
    if params[:id].present?
      @workflow = Workflow.accessible_by(@context).find_by_uid(params[:id])
      if @workflow.nil?
        flash[:error] = "Sorry, this workflow does not exist or is not accessible by you"
        redirect_to workflows_path
        return
      else
        @revisions = @workflow.workflow_series.accessible_revisions(@context).select(:title, :id, :dxid, :uid, :revision)
      end
      js_param[:workflow] = @workflow.slice(:id, :dxid, :uid, :readme, :spec)
    end

    jobs = Job.includes(:analysis).where(user_id: @context.user_id).where.not(state: Job::TERMINAL_STATES)
    jobs.each { |job| User.sync_job!(@context, job.id) }
    User.sync_jobs!(@context)

    if @workflow.present?
      analysis_arel = Analysis.arel_table
      batch_ids = ActiveRecord::Base.connection.execute("select min(id) from analyses where batch_id is not null group by batch_id").to_a.flatten
      analyses = @workflow.analyses.editable_by(@context).includes({jobs: :app}, :workflow).where( analysis_arel["batch_id"].eq(nil).or(analysis_arel["id"].in(batch_ids)))

      batches = Analysis.where(id: batch_ids)
      batches.each do |b|
        batch_json[b.batch_id] = Analysis.where(batch_id: b.batch_id)
      end
      batch_hash = Analysis.batch_hash(analyses.where("batch_id is not NULL"))
      js_param[:batch_hash] = batch_hash

      comment_data

      js_param[:analyses_jobs] = Analysis.job_hash(analyses.where(batch_id: nil), workflow_details: true, batches: batch_hash)
    else
      analysis_arel = Analysis.arel_table
      batch_ids = ActiveRecord::Base.connection.execute("select min(id) from analyses where batch_id is not null group by batch_id").to_a.flatten
      analyses = Analysis.editable_by(@context).includes({jobs: :app}, :workflow).where( analysis_arel["batch_id"].eq(nil).or(analysis_arel["id"].in(batch_ids)))

      batch_hash = Analysis.batch_hash(analyses.where("batch_id is not NULL"))
      js_param[:batch_hash] = batch_hash
      js_param[:analyses_jobs] = Analysis.job_hash(analyses.where(batch_id: nil), workflow_details: true, batches: batch_json)
    end

    @analyses_grid = initialize_grid(analyses,
      name: 'analyses',
      order: 'analyses.id',
      order_direction: 'desc',
      per_page: 100,)
    @my_workflows = WorkflowSeries.editable_by(@context).order(name: :asc).map { |s| s.latest_accessible(@context) }.reject(&:nil?)

    js js_param.merge({ batches: batch_hash })
  end

  def fork
    @workflow = Workflow.accessible_by(@context).find_by_uid(params[:id])
    if @workflow.nil?
      flash[:error] = "Sorry, you do not have permissions to fork this workflow"
      redirect_to workflows_path
      return
    end
    app_series = AppSeries.accessible_by(@context).joins(:apps).merge(App.accessible_by(@context)).distinct
    private_app_series = app_series.where(scope: "private")
    public_app_series = app_series.where(scope: "public")
    js apps: { private_apps: private_app_series.map { |app_series| app_series.slice(:id, :name) }, public_apps: public_app_series.map { |app_series| app_series.slice(:id, :name) } }, workflow: @workflow
  end

  def cwl_export
    send_data cwl_exporter.workflow_export(@workflow), filename: "#{@workflow.name}.tar.gz"
  end

  def wdl_export
    send_data wdl_exporter.workflow_export(@workflow), filename: "#{@workflow.name}.tar.gz"
  end

  def batch_workflow
    @workflow = Workflow.accessible_by(@context).find_by_uid(params[:id])

    if @workflow.nil?
      flash[:error] = "Sorry, this workflow does not exist or is not accessible by you"
      redirect_to workflows_path
      return
    elsif !@workflow.allow_batch_run?
      flash[:error] = "Sorry, this workflow cannot be run in a batch"
      redirect_to workflows_path
      return
    else
      @revisions = @workflow.workflow_series.accessible_revisions(@context)
    end

    inputs = @workflow.batch_input_spec.select { |input| input[:values][:id].nil? }
    outputs = @workflow.all_output_spec

    js workflow: @workflow, inputs: inputs, outputs: outputs,
                 folders: output_folders_list, scope: @workflow.accessible_scopes
  end

  def run_batch
    workflow_object = Workflow.find_by_uid(params[:id])
    folder = Folder.find(params[:folder_id]) if params[:folder_id].present?

    batch_id = workflow_object.dxid + '_' + "#{DateTime.now.to_i}"
    batch_one = params[:batch_input_one]
    batch_two = params[:batch_input_two]

    inputs1 = batch_one[:value].split(/\n/) rescue [] if batch_one.present? && batch_one['class'] == "string"
    inputs1 = batch_one[:value] if batch_one.present? && batch_one['class'] == "file"

    inputs2 = batch_two[:value].split(/\n/) rescue [] if batch_two.present? && batch_two['class'] == "string"
    inputs2 = batch_two[:value] if batch_two.present? && batch_two['class'] == "file"


    spec_names = workflow_object.all_input_spec.reject{|s| params['inputs'].map{|i| i["input_name"]}.include?(s["name"]) } rescue workflow_object.all_input_spec

    list_analyses = []
    inputs1.each do |i1|
      i2 = inputs2.shift rescue nil

      inputs = []
      input_spec_one = workflow_object.all_input_spec.find{|s| s["name"] == spec_names[0]["name"]}
      input_spec_two = workflow_object.all_input_spec.find{|s| s["name"] == spec_names[1]["name"]} rescue nil

      inputs.unshift({"class" => batch_one["class"], 'input_name' => input_spec_one["parent_slot"] + "." + input_spec_one[:name], 'input_value' => i1}) if batch_one.present?
      inputs.unshift({"class" => batch_two["class"], 'input_name' => input_spec_two["parent_slot"] + "." + input_spec_two[:name], 'input_value' => i2}) if batch_two && input_spec_two.present? rescue nil && inputs2.present?

      if params["inputs"]
        others = params["inputs"].dup.map do |v|
          val = v.dup
          val["input_name"] = workflow_object.all_input_spec.find{|s| s["name"] == v["input_name"]}["parent_slot"] + "." +  v["input_name"]
          val
        end

        inputs.unshift(*others)
      end

      workflow = {
          "workflow_id" => workflow_object.uid,
          "name" => workflow_object.name,
          "inputs" => inputs
      }
      to_run = workflow.dup
      to_run["api"] = workflow.dup

      analysis_dxid = run_workflow_once(to_run)

      analysis = Analysis.find_by_dxid(analysis_dxid)
      analysis.batch_id = batch_id
      analysis.save
      list_analyses.unshift(analysis)
    end

    if folder.present?
      list_analyses.each{|a| a.reload; a.jobs.each{|j| j.local_folder_id = folder.id; j.save}}
    end

    render json: {url: workflow_path(workflow_object)}

  end

  def terminate_batch
    terminate_analyses = Analysis.where(batch_id: params[:id])
    if terminate_analyses.present?
      terminated_analyses = []
      terminate_analyses.each do |a|
        dxid = DNAnexusAPI.new(@context.token).call(a.dxid, "terminate")
        terminated_analyses.append(dxid)
      end
      if request.referrer.present?
        redirect_to request.referrer
      else
        redirect_to workflow_path(terminate_analyses.first.workflow.dxid)
      end
    else
      flash[:error] = "No accessible Analyses Found"
      redirect_to workflows_path
    end
  end

  def convert_file_with_strings
    file = params[:file_field]
    file_content = file.tempfile.read
    file_content = file_content.each_line.reject{|x| x.strip == ""}.join.force_encoding('utf-8')
    size_of_inputs = file_content.each_line.first.split("\t").size
    content =
      if size_of_inputs > 1
        input1 = []
        input2 = []
        file_content.each_line do |line|
          arr = line.strip.split("\t")
          input1 << arr[0]
          input2 << arr[1]
        end
        input1 = input1.join("\n")
        input2 = input2.join("\n")
        [input1, input2]
      else
        [file_content]
      end
    render json: { content: content }
  end

  def output_folders_list
    parent_folder_id ||= params[:parent_folder_id]

    workflow = Workflow.find_by_uid(params[:id])
    folders =
      if workflow.in_space?
        space = Space.from_scope(workflow.scope)
        Folder.accessible_by_space(space)
      else
        Folder
          .private_for(@context)
          .editable_by(@context)
          .where(parent_folder_id: parent_folder_id)
      end
    if folders.blank?
      result = { folders: [] }
    else
      folders_attr = folders.pluck(:id, :name)
      result = { folders: folders_attr.map{ |el| { id: el[0], name: el[1] } } }
    end
  end

  # usage on the platform
  def output_folders_list_platform
    current_folder = params[:current_folder] || "/"
    response = output_folder_service.list(current_folder)
    if response['folders']
      result = { folders: response['folders'] }
    else
      result = JSON.parse(response.body)['error']
    end

    # render json: result
  end

  # TODO: checkout the :public
  # TODO: parent_folder_id usage with nested folders lists
  # params[:name] = 'More NEXT'
  # params[:parent_folder_id] = nil
  # params[:public] = false
  def output_folder_create
    workflow = Workflow.find_by_uid(params[:id])

    is_public_folder = params[:public] == "true"

    if is_public_folder
      if @context.user.can_administer_site?
        parent_folder = Folder.accessible_by_public.find_by(id: params[:parent_folder_id])
        scope = "public"
      else
        flash[:error] = "You are not allowed to create public folders"
        redirect_to explore_files_path
        return
      end
    elsif workflow.in_space?
      parent_folder = Folder.editable_by(@context).find_by(id: params[:parent_folder_id])
      scope = workflow.scope
    else
      parent_folder = Folder.editable_by(@context).find_by(id: params[:parent_folder_id])
      scope = "private"
    end

    service = FolderService.new(@context)
    result = service.add_folder(params[:name], parent_folder, scope)

    if result.failure?
      res = { folders: result.value.values }
    else
      res = { folders: { id: result.value.id, name: result.value.name } }
    end

    render json: res
  end

  # usage on the platform
  def output_folder_create_platform
    response = output_folder_service.create(params[:folder])
    if response['id'] == @context.user.private_files_project || response['id'] == @context.user.public_files_project
      result = {result: 'Status Update: 200'}
      output_folder_update
    else
      result = JSON.parse(response.body)['error']

      render json: result
    end
  end

  # usage on the platform
  def output_folder_update_platform
    response = output_folder_service.update(@workflow, params[:folder])
    if response['id'] == @workflow.dxid
      result = {result: 'Status Update: 200'}
    else
      result = JSON.parse(response.body)['error']
    end

    render json: result
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
    @workflow = Workflow.accessible_by(@context).find_by_uid!(params[:id])

    # Assets should be accessible and licenses accepted
    @workflow.apps.each do |app|
      if app.assets.accessible_by(@context).count != app.assets.count
        flash[:error] = "This app cannot be exported because one or more assets are not accessible by the current user."
        redirect_to app_path(app)
      elsif app.assets.any? { |a| a.license.present? && !a.licensed_by?(@context) }
        flash[:error] = "This app contains one or more assets which need to be licensed. Please run the app first in order to accept the licenses."
        redirect_to app_path(app)
      end
    end
  end

  def output_folder_service
    @output_folder_service ||= OutputFolderService.new(
      api: DNAnexusAPI.new(@context.token),
      context: @context,
      workflow: @workflow
    )
  end

  private

  def comment_data
    @items_from_params = [@workflow]
    @item_path = pathify(@workflow)
    @item_comments_path = pathify_comments(@workflow)

    if @workflow.in_space?
      space = item_from_uid(@workflow.scope)
      @comments = Comment.where(commentable: space, content_object: @workflow).order(id: :desc).page params[:comments_page]
    else
      @comments = @workflow.root_comments.order(id: :desc).page params[:comments_page]
    end

  end

end
