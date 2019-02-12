module WorkflowConcern
  include ActiveSupport::Concern

  def render_error_method(error)
    json = { error: { type: "API Error", message: error.message } }
    json[:data] = error.data unless error.data.empty?
    render json: json, status: 422
  end

  def run_workflow_once(workflow_params)
    analysis_name = workflow_params["name"]
    fail "The workflow 'analysis_name' must be a nonempty string." unless analysis_name.is_a?(String) && analysis_name != ""

    workflow_id = workflow_params["workflow_id"]
    fail "The workflow 'workflow_id' must be a nonempty string." unless workflow_id.is_a?(String) && workflow_id != ""
    workflow = Workflow.accessible_by(@context).find_by_uid(workflow_id)
    fail "Workflow with id #{workflow_id} does not exist or is not accessible by you" if workflow.nil?

    inputs = workflow_params["inputs"] || []
    fail "If provided, the workflow 'inputs' must be an array of hashes." unless inputs.is_a?(Array) && inputs.all? { |s| s.is_a?(Hash) }

    workflow_input_spec = workflow.input_spec_hash
    unseen_workflow_inputs = workflow.unused_input_spec_hash
    dx_run_workflow_inputs = {}
    stage_inputs = Hash.new { |h, k| h[k] = {} }

    inputs.each do |api_input|
      input_name = api_input["input_name"]
      stage_input_name_match = /^(stage-\w{14}).(\w+)$/.match(input_name)
      fail "Invalid value for input_name" if stage_input_name_match.captures.size != 2
      stage = stage_input_name_match[1]
      matched_input_name = stage_input_name_match[2]

      input_klass = api_input["class"]
      fail "The input named '#{input_name}' has invalid type '#{input_klass}'. Valid types are: #{App::VALID_IO_CLASSES.join(', ')}." unless App::VALID_IO_CLASSES.include?(input_klass)

      input_value = api_input["input_value"]
      optional = workflow_input_spec[stage][matched_input_name]["optional"]
      unseen_workflow_inputs[stage].delete(matched_input_name)
      next if optional && !input_value.present?
      case input_klass
      when "file"
        fail "#{input_name}: input file value is not a string" unless input_value.is_a?(String)
        file = UserFile.real_files.accessible_by(@context).find_by_uid(input_value)
        fail "#{input_name}: input file is not accessible or does not exist" if file.nil?
        fail "#{file.name}: input file is not accessible to this space" unless file.scope.in?(workflow.accessible_scopes)
        fail "#{input_name}: input file's license must be accepted" unless !file.license.present? || file.licensed_by?(@context)

        input_value = { "$dnanexus_link" => file.dxid }
      when "int"
        fail "#{input_name}: value is not an integer" unless input_value.to_i.to_s == input_value
        input_value = input_value.to_i
      when "float"
        fail "#{input_name}: value is not a float" unless input_value.starts_with?(input_value.to_f.to_s)
        input_value = input_value.to_f
      when "boolean"
        fail "#{input_name}: value is not a boolean" unless input_value == true || input_value == false
      when "string"
        fail "#{input_name}: value is not a string" unless input_value.is_a?(String)
      end
      dx_run_workflow_inputs[input_name] = input_value

      stage_inputs[stage][matched_input_name] = input_value
    end

    unseen_workflow_inputs.each do |stage, inputs|
      inputs.each do |name, input|
        fail "The required input '#{stage}.#{name}' is missing" unless input["optional"]
      end
    end

    project = workflow.project
    workflow_params = {
      name: analysis_name,
      input: dx_run_workflow_inputs,
      project: project,
    }

    api = DNAnexusAPI.new(@context.token)
    permission = api.call(workflow.dxid, "listProjects")[workflow.project]
    fail(t('api.errors.invalid_permission', title: workflow.title), permission: permission) if permission == 'VIEW'
    response = api.run_workflow(workflow.dxid, workflow_params)
    analysis_dxid = response["id"]
    analysis = Analysis.create!(name: analysis_name, workflow_id: workflow.id, dxid: analysis_dxid, user_id: current_user.id)

    response["stages"].each_with_index do |job_id, idx|
      # Create job record
      app = workflow.stages_apps[idx]
      stage = workflow.input_spec["stages"][idx]
      run_inputs = {}
      input_file_dxids = []
      stage_inputs[stage["slotId"]].each do |input_name, input_value|
        if input_value.is_a?(Hash)
          if input_value["$dnanexus_link"].is_a?(String) && /^file-/.match(input_value["$dnanexus_link"])
            input_file_dxids << input_value["$dnanexus_link"]
            run_inputs[input_name] = input_value["$dnanexus_link"]
          end
        else
          run_inputs[input_name] = input_value
        end
      end

      # TODO: Candidate for refactoring. See JobCreator
      opts = {
        dxid: job_id,
        app_series_id: app.app_series_id,
        analysis_id: analysis.id,
        app_id: app.id,
        project: project,
        run_inputs: run_inputs,
        state: "idle",
        name: app.title,
        describe: {},
        scope: workflow.in_space? ? workflow.scope : "private",
        user_id: @context.user_id,
        run_instance_type: stage["instanceType"],
      }
      provenance = { job_id => { workflow_dxid: workflow.dxid, workflow_id: workflow.id, inputs: run_inputs } }
      input_file_dxids.uniq!
      input_file_ids = []
      UserFile.accessible_by(@context).where(dxid: input_file_dxids).find_each do |file|
        if file.parent_type == "Job"
          if file.parent
            parent_job = file.parent
            provenance.merge!(parent_job.provenance)
            provenance[file.dxid] = parent_job.dxid
          end
        end
        input_file_ids << file.id
      end
      opts[:provenance] = provenance
      Job.transaction do
        job = Job.create!(opts)
        job.input_file_ids = input_file_ids
        job.save!
      end
    end
    analysis_dxid
  end

  def fail(msg, data = {})
    raise ApiError.new(msg, data)
  end
end
