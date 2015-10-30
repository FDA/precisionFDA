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
      f
    end

    render json: result
  end

  # Inputs:
  #
  # name (string, required, nonempty)
  # description (string, optional)
  #
  # Outputs:
  #
  # id (string, "file-xxxx")
  #
  def create_file
    name = params["name"]
    raise unless name.is_a?(String) && name != ""

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
                       parent: User.find(@context.user_id),
                       public: false)
      # Must get a fresh user inside the transaction
      user = User.find(@context.user_id)
      user.open_files_count = user.open_files_count + 1
      user.save!
    end

    render json: {id: dxid}
  end

  # Inputs:
  #
  # name (string, required, nonempty)
  # description (string, optional)
  # paths (array:string, required)
  #
  # Outputs:
  #
  # id (string, "file-xxxx")
  #
  def create_asset
    name = params["name"]
    raise unless name.is_a?(String) && name != ""
    raise unless ((name.end_with?(".tar") && name.size > ".tar".size) || (name.end_with?(".tar.gz") && name.size > ".tar.gz".size))

    description = params["description"]
    if !description.nil?
      raise unless description.is_a?(String)
    end

    paths = params["paths"]
    raise unless paths.is_a?(Array) && !paths.empty? && paths.size < 100000
    paths.each_key do |path|
      raise unless path.is_a?(String) && path != "" && path.size < 4096
    end

    project = User.find(@context.user_id).private_files_project
    dxid = DNAnexusAPI.new(@context.token).("file", "new", {"name": params["name"], "project": project})["id"]

    User.transaction do
      asset = Asset.create!(dxid: dxid,
                            project: project,
                            name: name,
                            state: "open",
                            description: description,
                            user_id: @context.user_id,
                            public: false)
      asset.parent = asset
      asset.save!
      paths.each do |path|
        name = path.split('/').last
        if name == "" || name == "." || name == ".."
          name = nil
        end
        asset.archive_entries.create!(path: path, name: name)
      end
      # Must get a fresh user inside the transaction
      user = User.find(@context.user_id)
      user.open_assets_count = user.open_assets_count + 1
      user.save!
    end

    render json: {id: dxid}
  end

  # Inputs:
  #
  # size (int, required)
  # md5 (string, required)
  # index (int, required)
  # id (string, required)
  #
  # Outputs:
  #
  # url (string, where HTTP PUT must be performed)
  # expires (int, timestamp)
  # headers (hash of string key/values, headers must be given to HTTP PUT)
  #
  def get_upload_url
    size = params["size"]
    raise unless size.is_a?(Fixnum)

    md5 = params["md5"]
    raise unless md5.is_a?(String)

    index = params["index"]
    raise unless index.is_a?(Fixnum)

    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    file = UserFile.find_by!(dxid: id, state: "open", user_id: @context.user_id)

    result = DNAnexusAPI.new(@context.token).(id, "upload", {size: size, md5: md5, index: index})

    render json: result
  end

  # Inputs:
  #
  # id (string, required)
  #
  # Outputs: nothing (empty hash)
  #
  def close_file
    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    file = UserFile.find_by!(dxid: id, user_id: @context.user_id, parent_type: "User")
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

  # Inputs:
  #
  # id (string, required)
  #
  # Outputs: nothing (empty hash)
  #
  def close_asset
    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    file = Asset.find_by!(dxid: id, user_id: @context.user_id)
    if file.state == "open"
      DNAnexusAPI.new(@context.token).(id, "close")
      User.transaction do
        # Must recheck inside the transaction
        file.reload
        if file.state == "open"
          user = User.find(@context.user_id)
          user.open_assets_count = user.open_assets_count - 1
          user.closing_assets_count = user.closing_assets_count + 1
          user.save!
          file.state = "closing"
          file.save!
        end
      end
    end

    render json: {}
  end

  # Inputs
  #
  # id (string, required): the dxid of the app to run
  # name (string, required): the name of the job
  # inputs (hash, required): the inputs
  # instance_type (string, optional): override of the default instance type
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
    input_file_dxids = []
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
        raise unless UserFile.real_files.accessible_by(@context.user_id).where(dxid: value).exists?
        dxvalue = {"$dnanexus_link" => value}
        input_file_dxids << value
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
      app_series_id: @app.app_series_id,
      app_id: @app.id,
      project: project,
      run_inputs: run_inputs,
      state: "idle",
      name: name,
      describe: {},
      user_id: @context.user_id
    }
    if run_instance_type.present?
      opts[:run_instance_type] = run_instance_type
    end
    provenance = {jobid => {app_dxid: @app.dxid, app_id: @app.id, inputs: run_inputs}}
    input_file_dxids.uniq!
    input_file_ids = []
    UserFile.accessible_by(@context.user_id).where(dxid: input_file_dxids).find_each do |file|
      if file.parent_type == "Job"
        parent_job = file.parent
        provenance.merge!(parent_job.provenance)
        provenance[file.dxid] = parent_job.dxid
      end
      input_file_ids << file.id
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

    render json: {id: jobid}
  end

  def create_app
    #name, title, readme, input_spec, output_spec, internet_access, instance_type, ordered_assets, packages, code, is_new
  end

  # Inputs
  #
  # id (string, required): the dxid of the asset to describe
  #
  # Outputs:
  #
  # description (string): the markdown README of the asset
  # archive_entries (array:string): a list of "paths" included in the archive
  #
  def describe_asset
    # App id should be a string
    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    asset = Asset.accessible_by(@context.user_id).find_by!(dxid: id)

    render json: {
      description: asset.description || "",
      archive_entries: asset.archive_entries.map(&:path)
    }
  end

  # Inputs
  #
  # prefix (string, required): the prefix to search for
  #
  # Outputs:
  #
  # ids (array:string): the matchin asset dxids
  def search_assets
    # Prefix should be a string with at least three characters
    prefix = params["prefix"]
    raise unless prefix.is_a?(String) && prefix.size >= 3

    ids = Asset.accessible_by(@context.user_id).with_search_keyword(prefix).select(:dxid).distinct.limit(1000).map(&:dxid)
    render json: { ids: ids }
  end
end
