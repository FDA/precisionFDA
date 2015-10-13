class ApiController < ApplicationController
  # TODO change all of this when this API will be called from the command-line.
  # For now don't skip the :require_login middleware, since this API is called from the web.
  skip_before_action :verify_authenticity_token

  before_action :enforce_json_post

  def enforce_json_post
  end

  def list_files
    result = UserFile.real_files.accessible_by(@context.user_id).map do |file|
      f = file.as_json
      f["username"] = file.user["dxuser"]
      #TODO assumes biospecimens are all public
      f["biospecimen"] = file.biospecimen.as_json
      if f["biospecimen"].present?
        f["biospecimen"]["username"] = file.biospecimen.user["dxuser"]
      end
      f
    end

    render json: result
  end

  def create_file
    name = params["name"]
    raise unless name.is_a?(String) && name != ""

    biospecimen_id = params["biospecimen_id"]
    if !biospecimen_id.nil?
      raise unless biospecimen_id.is_a?(Fixnum)
      # TODO: For now assume all biospecimens are public
      biospecimen = Biospecimen.find(params["biospecimen_id"])
    end

    description = params["description"]
    if !description.nil?
      raise unless description.is_a?(String)
    end

    project = User.find(@context.user_id).private_files_project
    dxid = DNAnexusAPI.new(@context.token).("file", "new", {"name": params["name"], "project": project})["id"]

    User.transaction do
      UserFile.create!(dxid: dxid,
                       project: project,
                       name: name,
                       state: "open",
                       description: description,
                       user_id: @context.user_id,
                       biospecimen_id: biospecimen_id,
                       parent: User.find(@context.user_id),
                       public: false)
      # Must get a fresh user inside the transaction
      user = User.find(@context.user_id)
      user.open_files_count = user.open_files_count + 1
      user.save!
    end

    render json: {id: dxid}
  end

  def get_upload_url
    size = params["size"]
    raise unless size.is_a?(Fixnum)

    md5 = params["md5"]
    raise unless md5.is_a?(String)

    index = params["index"]
    raise unless index.is_a?(Fixnum)

    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    file = UserFile.real_files.find_by!(dxid: id, state: "open", user_id: @context.user_id)

    result = DNAnexusAPI.new(@context.token).(id, "upload", {size: size, md5: md5, index: index})

    render json: result
  end

  def close_file
    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    file = UserFile.real_files.find_by!(dxid: id, user_id: @context.user_id)
    if file.state == "open"
      DNAnexusAPI.new(@context.token).(id, "close")
      User.transaction do
        # Must recheck inside the transaction
        file.reload
        if file.state == "open"
          user = User.find(@context.user_id)
          user.open_files_count = user.open_files_count - 1
          user.closing_files_count = user.closing_files_count + 1
          user.save!
          file.state = "closing"
          file.save!
        end
      end
    end

    render json: {}
  end

  def run_app
    # App id should be a string
    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    # Name should be a nonempty string
    name = params["name"]
    raise unless name.is_a?(String) && name != ""

    # Inputs should be a hash (more checks later)
    inputs = params["inputs"]
    raise unless inputs.is_a?(Hash)

    # App should exist and be accessible
    @app = App.accessible_by(@context.user_id, @context.org_id).find_by!(dxid: id)

    # Inputs should be compatible
    # (The following also normalizes them)
    run_inputs = {}
    dx_run_input = {}
    input_file_ids = []
    @app.input_spec.each do |input|
      key = input["name"]
      optional = (input["optional"] == true)
      has_default = input.has_key?("default")
      default = input["default"]
      klass = input["class"]
      choices = input["choices"]

      if inputs.has_key?(key)
        value = inputs[key]
      elsif has_default
        value = default
      elsif optional
        # No given value and no default, but input is optional; move on
        next
      else
        # Required input is missing
        raise
      end

      # Check compatibility with choices
      raise if choices.present? && !choices.include?(value)

      if klass == "file"
        raise unless value.is_a?(String)
        # TODO decide if we will allow ComparisonOutput files to partake as inputs
        # ie if we need .real_files scope below
        raise unless UserFile.accessible_by(@context.user_id).where(dxid: value).count == 1
        dxvalue = {"$dnanexus_link" => value}
        input_file_ids << value
      elsif klass == "int"
        raise unless value.is_a?(Numeric) && (value.to_i == value)
        value = value.to_i
      elsif klass == "float"
        raise unless value.is_a?(Numeric)
      elsif klass == "boolean"
        raise unless value == true || value == false
      elsif klass == "string"
        raise unless value.is_a?(String)
      end

      run_inputs[key] = value
      dx_run_input[key] = dxvalue || value
    end

    # User can override the instance type
    if params.has_key?("instance_type")
      raise unless Job::INSTANCE_TYPES.has_key?(params["instance_type"]) #Checks also that it's a string
      run_instance_type = params["instance_type"]
    end

    project = User.find(@context.user_id).private_files_project

    # TODO: Timeout policy
    api_input = {
      name: name,
      input: dx_run_input,
      project: project
    }
    if run_instance_type.present?
      api_input[:systemRequirements] = {main: {instanceType: Job::INSTANCE_TYPES[run_instance_type]}}
    end

    # Run the app
    jobid = DNAnexusAPI.new(@context.token).call(@app.dxid, "run", api_input)["id"]

    # Create job record
    opts = {
      dxid: jobid,
      series: @app.series,
      app_id: @app.id,
      project: project,
      spec: @app.spec,
      run_inputs: run_inputs,
      app_meta: {version: @app.version, name: @app.name, title: @app.title, user_id: @app.user_id},
      state: "idle",
      name: name,
      describe: {},
      user_id: @context.user_id
    }
    if run_instance_type.present?
      opts[:run_instance_type] = run_instance_type
    end
    provenance = {jobid => {app_version: @app.version, app_name: @app.name, app_title: @app.title, app_user_id: @app.user_id, app_id: @app.id, inputs: run_inputs}}
    input_file_ids.uniq!
    UserFile.accessible_by(@context.user_id).where(id: input_file_ids).find_each do |file|
      if file.parent_type == "Job"
        parent_job = file.parent
        provenance.merge!(parent_job.provenance)
        provenance[file.dxid] = parent_job.dxid
      end
    end
    opts[:provenance] = provenance

    User.transaction do
      job = Job.create!(opts)
      job.input_file_ids = input_file_ids
      job.save!
      user = User.find(@context.user_id)
      user.pending_jobs_count = user.pending_jobs_count + 1
      user.save!
    end

    render json: {id: dxid}
  end
end
