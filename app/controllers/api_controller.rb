class ApiController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_before_action :require_login
  before_action :require_api_login, except: [:list_assets, :describe_asset, :search_assets, :list_notes]
  before_action :require_api_login_or_guest, only: [:list_assets, :describe_asset, :search_assets, :list_notes]

  before_action :enforce_json_post

  def enforce_json_post
  end

  def list_files
    result = []
    UserFile.real_files.accessible_by(@context).find_each do |file|
      result << {uid: file.uid, name: file.name}
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
                       scope: 'private')
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
    paths.each do |path|
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
                            scope: 'private')
      asset.parent = asset
      asset.save!
      asset.update!(parent_type: "Asset")
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
  #
  # Outputs
  #
  # id (string): the dxid of the resulting job
  #
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
    @app = App.accessible_by(@context).find_by!(dxid: id)

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
        raise unless UserFile.real_files.accessible_by(@context).where(dxid: value).exists?
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

    api_input = {
      name: name,
      input: dx_run_input,
      project: project,
      timeoutPolicyByExecutable: {@app.dxid => {"*" => {"days" => 2}}}
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
    UserFile.accessible_by(@context).where(dxid: input_file_dxids).find_each do |file|
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

  # Inputs
  #
  # name, title, readme, input_spec, output_spec, internet_access, instance_type, ordered_assets, packages, code, is_new
  #
  # Outputs
  #
  # id (string, only on success): the id of the created app, if success
  # failure (string, only on failure): a message that can be shown to the user due to failure
  def create_app
    begin
      name = params["name"]
      fail "The app 'name' must be a nonempty string." unless name.is_a?(String) && name != ""
      fail "The app 'name' can only contain the characters A-Z, a-z, 0-9, '.' (period), '_' (underscore) and '-' (dash)." unless name =~ /^[a-zA-Z0-9._-]+$/

      title = params["title"]
      fail "The app 'title' must be a nonempty string." unless title.is_a?(String) && title != ""

      readme = params["readme"]
      fail "The app 'Readme' must be a string." unless readme.is_a?(String)

      internet_access = params["internet_access"]
      fail "The app 'Internet Access' must be a boolean, true or false." unless ((internet_access == true) || (internet_access == false))

      instance_type = params["instance_type"]
      fail "The app 'instance type' must be one of: #{Job::INSTANCE_TYPES.keys.join(', ')}." unless Job::INSTANCE_TYPES.include?(instance_type)

      ordered_assets = params["ordered_assets"] || []
      fail "The app 'assets' must be an array of asset ids (strings)." unless ordered_assets.is_a?(Array) && ordered_assets.all? { |a| a.is_a?(String) }

      packages = params["packages"] || []
      fail "The app 'packages' must be an array of package names (strings)." unless packages.is_a?(Array) && packages.all? { |a| a.is_a?(String) }

      packages.sort!.uniq!

      packages.each do |package|
        fail "The package '#{package}' is not a valid Ubuntu package." unless App::UBUNTU_PACKAGES.bsearch { |p| package <=> p }
      end

      code = params["code"]
      fail "The app 'code' must be a string." unless code.is_a?(String)

      is_new = params["is_new"] == true

      input_spec = params["input_spec"] || []
      fail "The app 'input spec' must be an array of hashes." unless input_spec.is_a?(Array) && input_spec.all? { |s| s.is_a?(Hash) }
      inputs_seen = Set.new
      input_spec = input_spec.each_with_index.map do |spec, i|

        i_name = spec["name"]
        fail "The #{(i+1).ordinalize} input is missing a name." unless i_name.is_a?(String) && i_name != ""
        fail "The input name '#{i_name}' contains invalid characters. It must start with a-z, A-Z or '_', and continue with a-z, A-Z, '_' or 0-9." unless i_name =~ /^[a-zA-Z_][0-9a-zA-Z_]*$/
        fail "Duplicate definitions for the input named '#{i_name}'." if inputs_seen.include?(i_name)
        inputs_seen << i_name

        i_class = spec["class"]
        fail "The input named '#{i_name}' is missing a type." unless i_class.is_a?(String) && i_class != ""
        fail "The input named '#{i_name}' contains an invalid type. Valid types are: #{App::VALID_IO_CLASSES.join(', ')}." unless App::VALID_IO_CLASSES.include?(i_class)

        i_optional = spec["optional"]
        fail "The input named '#{i_name}' is missing the 'optional' designation." unless (i_optional == true || i_optional == false)

        i_label = spec["label"]
        fail "The input named '#{i_name}' is missing a label." unless i_label.is_a?(String)

        i_help = spec["help"]
        fail "The input named '#{i_name}' is missing help text." unless i_help.is_a?(String)

        i_default = spec["default"]
        if !i_default.nil?
          fail "The default value provided for the input named '#{i_name}' is not of the right type." unless compatible(i_default, i_class)
          # Fix for JSON ambiguity of float/int for ints.
          i_default = i_default.to_i if i_class == "int"
        end

        i_choices = spec["choices"]
        if !i_choices.nil?
          fail "The 'choices' (possible values) provided for the input named '#{i_name}' were not a nonempty array." unless i_choices.is_a?(Array) && !i_choices.empty?
          fail "The 'choices' (possible values) provided for the input named '#{i_name}' were incompatible with the input type." unless i_choices.all? { |choice| compatible(choice, i_class) }
          fail "You cannot provide 'choices' (possible values) for the input named '#{i_name}' because it's not of type 'string' or 'int' or 'float'." unless ["string", "int", "float"].include?(i_class)
          i_choices.uniq!
        end

        i_patterns = spec["patterns"]
        if !i_patterns.nil?
          fail "You cannot provide filename patterns for the non-file input named '#{i_name}'." unless i_class == "file"
          fail "The filename patterns provided for the input named '#{i_name}' were not a nonempty array of nonempty strings." unless i_patterns.is_a?(Array) && !i_patterns.empty? && i_patterns.none?(&:empty?)
          i_patterns.uniq!
        end

        ret = {"name": i_name, "class": i_class, "optional": i_optional, "label": i_label, "help": i_help}
        ret["default"] = i_default unless i_default.nil?
        ret["choices"] = i_choices unless i_choices.nil?
        ret["patterns"] = i_patterns unless i_patterns.nil?
        ret
      end

      output_spec = params["output_spec"] || []
      fail "The app 'output spec' must be an array of hashes." unless output_spec.is_a?(Array) && output_spec.all? { |s| s.is_a?(Hash) }
      outputs_seen = Set.new
      output_spec = output_spec.each_with_index.map do |spec, i|
        i_name = spec["name"]
        fail "The #{(i+1).ordinalize} output is missing a name." unless i_name.is_a?(String) && i_name != ""
        fail "The output name '#{i_name}' contains invalid characters. It must start with a-z, A-Z or '_', and continue with a-z, A-Z, '_' or 0-9." unless i_name =~ /^[a-zA-Z_][0-9a-zA-Z_]*$/
        fail "Duplicate definitions for the output named '#{i_name}'." if outputs_seen.include?(i_name)
        outputs_seen << i_name

        i_class = spec["class"]
        fail "The output named '#{i_name}' is missing a type." unless i_class.is_a?(String) && i_class != ""
        fail "The output named '#{i_name}' contains an invalid type. Valid types are: #{App::VALID_IO_CLASSES.join(', ')}." unless App::VALID_IO_CLASSES.include?(i_class)

        i_optional = spec["optional"]
        fail "The output named '#{i_name}' is missing the 'optional' designation." unless (i_optional == true || i_optional == false)

        i_label = spec["label"]
        fail "The output named '#{i_name}' is missing a label." unless i_label.is_a?(String)

        i_help = spec["help"]
        fail "The output named '#{i_name}' is missing help text." unless i_help.is_a?(String)

        i_patterns = spec["patterns"]
        if !i_patterns.nil?
          fail "You cannot provide filename patterns for the non-file output named '#{i_name}'." unless i_class == "file"
          fail "The filename patterns provided for the output named '#{i_name}' were not a nonempty array of nonempty strings." unless i_patterns.is_a?(Array) && !i_patterns.empty? && i_patterns.none?(&:empty?)
          i_patterns.uniq!
        end

        ret = {"name": i_name, "class": i_class, "optional": i_optional, "label": i_label, "help": i_help}
        ret["patterns"] = i_patterns unless i_patterns.nil?
        ret
      end

      app = nil
      App.transaction do
        ordered_assets.each do |asset_dxid|
          fail "The app asset with id '#{asset_dxid}' does not exist or is not accessible by you." unless Asset.closed.accessible_by(@context).where(dxid: asset_dxid).exists?
        end
        app_series_dxid = AppSeries.construct_dxid(@context.username, name)
        app_series = AppSeries.find_by(dxid: app_series_dxid)
        if is_new
          fail "You already have an app by the name '#{name}'." unless app_series.nil?
          app_series = AppSeries.create!(
            dxid: app_series_dxid,
            name: name,
            latest_revision_app_id: nil,
            latest_version_app_id: nil,
            user_id: @context.user_id,
            scope: "private"
          )
          revision = 1
        else
          fail "You don't have an app by the name '#{name}'." if app_series.nil?
          revision = app_series.latest_revision_app.revision + 1
        end

        api = DNAnexusAPI.new(@context.token)
        user = User.find(@context.user_id)
        project = user.private_files_project
        applet_dxid = api.call("applet", "new", {
          project: project,
          inputSpec: input_spec.map { |spec| spec.reject { |key,value| key == "default" || key == "choices" } },
          outputSpec: output_spec,
          runSpec: {
            code: code_remap(code),
            interpreter: "bash",
            systemRequirements: {
              "*" => {instanceType: Job::INSTANCE_TYPES[instance_type]}
            },
            distribution: "Ubuntu",
            release: "14.04",
            execDepends: packages.map { |p| {name: p}}
          },
          dxapi: "1.0.0",
          access: internet_access ? {network: ["*"]} : {}
        })["id"]
        dxid = api.call("app", "new", {
          applet: applet_dxid,
          name: AppSeries.construct_dxname(@context.username, name),
          title: title + " ",
          summary: " ",
          description: readme + " ",
          version: "r#{revision}-#{SecureRandom.hex(3)}",
          resources: ordered_assets,
          details: {ordered_assets: ordered_assets},
          openSource: false,
          billTo: Rails.env.development? ? "user-#{@context.username}" : user.billto,
          access: internet_access ? {network: ["*"]} : {}
        })["id"]
        api.call(project, "removeObjects", {objects: [applet_dxid]})
        app = App.create!(
          dxid: dxid,
          version: nil,
          revision: revision,
          title: title,
          readme: readme,
          user_id: @context.user_id,
          scope: "private",
          app_series_id: app_series.id,
          input_spec: input_spec,
          output_spec: output_spec,
          internet_access: internet_access,
          instance_type: instance_type,
          ordered_assets: ordered_assets,
          packages: packages,
          code: code
        )
        app.asset_ids = Asset.accessible_by(@context).where(dxid: ordered_assets).select(:id).map(&:id)
        app.save!
        app_series.update!(latest_revision_app_id: app.id)
      end

      render json: {id: app.dxid}

    rescue ApiError => e
      render json: {failure: e.message}
    end
  end

  # Inputs
  #
  # ids (array:string, optional): the dxids of the assets
  #
  # Outputs:
  #
  # An array of hashes, each of which contains the following:
  #
  # dxid (string)
  # name (string)
  #
  def list_assets
    ids = params[:ids]
    if !ids.nil?
      raise unless ids.is_a?(Array) && ids.all? { |id| id.is_a?(String) }
      assets = Asset.closed.accessible_by(@context).where(dxid: ids)
    else
      assets = Asset.closed.accessible_by(@context)
    end

    result = assets.order(:name).select(:dxid, :name).map do |asset|
      {dxid: asset.dxid, name: asset.prefix }
    end

    if !ids.nil?
      # This would happen if an asset becomes inaccessible
      # For now silently drop the asset -- allows for asset deletion
      # raise unless ids.size == result.size
    end

    render json: result
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

    asset = Asset.accessible_by(@context).find_by!(dxid: id)

    render json: {
      description: asset.description || "",
      archive_entries: asset.file_paths
    }
  end

  # Inputs
  #
  # prefix (string, required): the prefix to search for
  #
  # Outputs:
  #
  # ids (array:string): the matching asset dxids
  #
  def search_assets
    # Prefix should be a string with at least three characters
    prefix = params["prefix"]
    raise unless prefix.is_a?(String) && prefix.size >= 3

    ids = Asset.closed.accessible_by(@context).with_search_keyword(prefix).order(:name).select(:dxid).distinct.limit(1000).map(&:dxid)
    render json: { ids: ids }
  end


  # Inputs
  #
  # -
  #
  # Outputs:
  #
  # An array of hashes, each of which contains the following:
  #
  # id (integer)
  # slug (string)
  # title (string)
  #
  def list_notes
    notes = Note.editable_by(@context)

    result = notes.select(:id, :title).map do |note|
      {id: note.id, slug: note.to_param, title: note.title }
    end

    render json: result
  end

  # Inputs
  #
  # id (number, required): the id of the note to describe
  #
  # Outputs:
  #
  # content (string): the markdown README of the note
  #
  def describe_note
    id = params[:id]
    raise unless id.is_a?(Numeric) && id != ""

    note = Note.accessible_by(@context).find_by!(id: id)

    render json: {
      content: note.content || ""
    }
  end

  # Use this to add multiple items of the same type to a note
  # or multiple notes to an item
  # Inputs
  #
  # note_ids (Array[integer], required): array of note ids
  # item_ids (Array[integer], required): array of item ids
  # item_type (string, required): type of string from App, Comparison, Job, or UserFile
  #
  # Outputs:
  #
  # notes_added (Array[integer])
  # items_added (Array[integer])
  #
  def attach_to_notes
    note_ids = params[:note_ids]
    raise unless note_ids.is_a?(Array) && note_ids.all? { |id| id.is_a?(Numeric) }

    item_ids = params[:item_ids]
    raise unless item_ids.is_a?(Array) && item_ids.all? { |id| id.is_a?(Numeric) }

    item_type = params[:item_type]
    raise unless item_type.is_a?(String) && ["App", "Comparison", "Job", "UserFile"].include?(item_type)

    notes_added = {}
    items_added = {}
    Note.transaction do
      note_ids.each do |note_id|
        note = Note.editable_by(@context).find_by!(id: note_id)
        item_ids.each do |item_id|
          note.attachments.find_or_create_by(item_id: item_id, item_type: item_type)
          items_added[item_id] = true
        end
        notes_added[note_id] = true
        note.save
      end
    end

    render json: {
      notes_added: notes_added,
      items_added: items_added
    }
  end

  # Inputs
  #
  # id (integer, required): the id of the note to be updated
  # title (string): the updated note title
  # content (string): the updated note content
  # attachments_to_save (string array): an array of one or more object uids to be "ensured"
  # attachments_to_delete (string array): an array of one or more object uids to be removed
  #
  # Outputs:
  # id: the note id
  # path (string): the human readable path of the note (which could have changed if the title changed)
  #
  def update_note
    id = params[:id].to_i
    raise unless id.is_a?(Integer)

    title = params[:title]
    raise unless title.is_a?(String)

    content = params[:content] || ""
    raise unless content.is_a?(String)

    attachments_to_save = params[:attachments_to_save] || []
    raise unless attachments_to_save.is_a?(Array)

    attachments_to_delete = params[:attachments_to_delete] || []
    raise unless attachments_to_delete.is_a?(Array)

    note = nil
    Note.transaction do
      note = Note.editable_by(@context).find_by!(id: params[:id])

      attachments_to_save.each do |uid|
        item = item_from_uid(uid)
        note.attachments.find_or_create_by(item: item)
      end

      attachments_to_delete.each do |uid|
        item = item_from_uid(uid)
        note.attachments.where(item: item).destroy_all
      end

      note.update!(title: title, content: content)
    end

    render json: {
      id: note.id,
      path: note_path(note)
    }
  end

  protected

  def fail(msg)
    raise ApiError, msg
  end

  def code_remap(code)
    return <<END_OF_CODE
dx cat #{APPKIT_TGZ} | tar -z -x -C / --no-same-owner --no-same-permissions -f -
source /usr/lib/app-prologue
#{code}
{ set +x; } 2>/dev/null
source /usr/lib/app-epilogue
END_OF_CODE
  end

  def compatible(value, klass)
    if klass == "file"
      return value.is_a?(String)
    elsif klass == "int"
      return value.is_a?(Numeric) && (value.to_i == value)
    elsif klass == "float"
      return value.is_a?(Numeric)
    elsif klass == "boolean"
      return value == true || value == false
    elsif klass == "string"
      return value.is_a?(String)
    end
  end
end
