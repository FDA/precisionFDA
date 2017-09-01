class ApiController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_before_action :require_login
  before_action :require_api_login,        except: [:list_apps, :list_assets, :list_comparisons, :list_files, :list_jobs, :list_notes, :list_related, :describe, :search_assets]
  before_action :require_api_login_or_guest, only: [:list_apps, :list_assets, :list_comparisons, :list_files, :list_jobs, :list_notes, :list_related, :describe, :search_assets]

  rescue_from ApiError, :with => :render_error_method

  def render_error_method(e)
    render json: {error: {type: "API Error", message: e.message}}, status: 422
  end

  # Inputs
  #
  # scope (string, optional): "public" or "space-123" (default is "public")
  # uids (array of strings): one or more uids to publish to the scope
  #
  # Outputs
  #
  # published (number): the count of published objects
  def publish
    space = nil

    scope = params[:scope]
    if scope.nil?
      scope = "public"
    elsif scope.is_a?(String)
      if scope != "public"
        # Check that scope is a valid scope:
        # - must be of the form space-xxxx
        # - must exist in the Spa`ce table
        # - must be accessible by context
        fail "Invalid scope (only 'public' or 'space-xxxx' are accepted)" unless scope =~ /^space-(\d+)$/
        space = Space.find_by(id: $1.to_i)
        fail "Invalid space" unless space.present? && space.active? && space.accessible_by?(@context)
      end
    else
      fail "The optional 'scope' input must be a string (either 'public' or 'space-xxxx')"
    end

    uids = params[:uids]
    fail "The input 'uids' must be an array of object ids (strings)" unless uids.is_a?(Array) && uids.all? { |uid| uid.is_a?(String) }

    items = uids.uniq.map { |uid| item_from_uid(uid) }.reject { |item| item.public? || item.scope == scope }
    fail "Unpublishable items detected" unless items.all? { |item| item.publishable_by?(@context, scope) }

    # Files to publish:
    # - All real_files selected by the user
    # - All assets selected by the user
    files = items.select { |item| item.klass == "file" || item.klass == "asset" }

    # Comparisons
    comparisons = items.select { |item| item.klass == "comparison" }

    # Apps
    apps = items.select { |item| item.klass == "app" }

    # Jobs
    jobs = items.select { |item| item.klass == "job" }

    # Notes
    notes = items.select { |item| item.klass == "note" }

    # Discussions
    discussions = items.select { |item| item.klass == "discussion" }

    # Answers
    answers = items.select { |item| item.klass == "answer" }

    published_count = 0

    # Files
    if files.size > 0
      published_count += UserFile.publish(files, @context, scope)
    end

    # Comparisons
    if comparisons.size > 0
      published_count += Comparison.publish(comparisons, @context, scope)
    end

    # Apps
    if apps.size > 0
      published_count += AppSeries.publish(apps, @context, scope)
    end

    # Jobs
    if jobs.size > 0
      published_count += Job.publish(jobs, @context, scope)
    end

    # Notes
    if notes.size > 0
      published_count += Note.publish(notes, @context, scope)
    end

    # Discussions
    if discussions.size > 0
      published_count += Discussion.publish(discussions, @context, scope)
    end

    # Answers
    if answers.size > 0
      published_count += Answer.publish(answers, @context, scope)
    end

    render json: {published: published_count}
  end

  # Inputs
  # --
  # uid (String, required)
  # opts:
  #       scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or leave blank for all
  #       classes (Array, optional): array of valid classNames e.g. ["file", "comparison"] or leave blank for all
  #       editable (Boolean, optional): if filtering for only editable_by the context user, otherwise accessible_by
  #       describe (object, optional)
  #         fields (array, optional):
  #             Array containing field name [field_1, field_2, ...]
  #             to indicate which object fields to include
  #         include (object, optional)
  #             license (boolean, optional)
  #             user (boolean, optional)
  #             org (boolean, optional)
  #             all_tags_list (boolean, optional)
  #
  def list_related
    uid = params[:uid]
    item = item_from_uid(uid)

    if item.accessible_by?(@context)
      params[:opts] = params[:opts].is_a?(Hash) ? params[:opts] : {}

      scopes = params[:opts][:scopes]
      if !scopes.nil?
        fail "Option 'scopes' can only be an Array of Strings that are one of public, private or a space-xxxx id." unless scopes.is_a?(Array) && scopes.all?{ |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }
      end

      classes = params[:opts][:classes]
      if !classes.nil?
        fail "Option 'classes' can be undefined or an array of strings" unless classes.is_a?(Array) && classes.all? { |k| k.is_a?(String) }
      end

      scoped_items = lambda do |scoped_item, scopes_override = false|
        if !scopes.nil?
          scope_query = scopes_override ? scopes_override : {scope: scopes}
          scoped_item = scoped_item.where(scope_query)
        end
        if params[:opts][:editable]
          scoped_item = scoped_item.editable_by(@context)
        else
          scoped_item = scoped_item.accessible_by(@context)
        end

        return scoped_item.to_a
      end

      allow_klass = lambda do |klass|
        return classes.nil? || classes.include?(klass)
      end

      related = []
      case item.klass
        when "file"
          related.push(*(scoped_items.call(item.notes.real_notes))) if allow_klass.call("note")
          related.push(*(scoped_items.call(item.comparisons))) if allow_klass.call("comparison")
          if item.parent_type == "Job"
            related.push(*(scoped_items.call(Job.where(id: item.parent_id)))) if allow_klass.call("job")
          end
        when "note", "answer", "discussion"
          if item.klass == "discussion"
            scopes_override = !scopes.nil? ? {notes: {scope: scopes}} : false
            related.push(*(scoped_items.call(item.answers.joins(:note), scopes_override))) if allow_klass.call("answer")
          end
          if item.klass != "note"
            note = item.note
          else
            note = item
          end
          related.push(*(scoped_items.call(note.comparisons))) if allow_klass.call("comparison")
          related.push(*(scoped_items.call(note.real_files))) if allow_klass.call("file")
          related.push(*(scoped_items.call(note.apps))) if allow_klass.call("app")
          related.push(*(scoped_items.call(note.jobs))) if allow_klass.call("job")
          related.push(*(scoped_items.call(note.assets))) if allow_klass.call("asset")
        when "app"
          related.push(*(scoped_items.call(item.notes.real_notes))) if allow_klass.call("note")
          related.push(*(scoped_items.call(item.jobs))) if allow_klass.call("job")
          related.push(*(scoped_items.call(item.assets))) if allow_klass.call("asset")
        when "job"
          related.push(*(scoped_items.call(App.where(id: item.app_id)))) if allow_klass.call("app")
          related.push(*(scoped_items.call(item.notes.real_notes))) if allow_klass.call("note")
          related.push(*(scoped_items.call(item.input_files))) if allow_klass.call("file")
          related.push(*(scoped_items.call(item.output_files))) if allow_klass.call("file")
        when "asset"
        when "comparison"
          related.push(*(scoped_items.call(item.notes.real_notes))) if allow_klass.call("file")
          related.push(*(scoped_items.call(item.user_files))) if allow_klass.call("file")
        when "license"
        when "space"
        else
          fail "Unknown class #{item.klass}"
      end

      related = related.uniq.map {|o| describe_for_api(o, params[:opts][:describe])}
      render json: related
    else
      fail "You do not have permission to access #{id}"
    end
  end

  # Inputs:
  #
  # states (array of strings; optional): the file state/s to be returned "closed", "closing", and/or "open"
  # scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or leave blank for all
  # editable (Boolean, optional): if filtering for only editable_by the context user, otherwise accessible_by
  # describe (object, optional)
  #     fields (array, optional):
  #         Array containing field name [field_1, field_2, ...]
  #         to indicate which object fields to include
  #     include (object, optional)
  #         license (boolean, optional)
  #         user (boolean, optional)
  #         org (boolean, optional)
  #         all_tags_list (boolean, optional)
  #
  # Outputs:
  #
  # An array of hashes, each of which has these fields:
  # uid (string): the file's unique id (file-xxxxxx)
  # name (string): the filename
  # scopes (string): file scope, "public" or "private" or "space-xxxx"
  # path (string): file_path of the file
  #
  def list_files
    User.sync_files!(@context)

    if params[:editable]
      files = UserFile.real_files.editable_by(@context)
    else
      files = UserFile.real_files.accessible_by(@context)
    end

    if params[:scopes].present?
      fail "Scopes can only be an Array of Strings that are one of public, private or a space-xxxx id." unless params[:scopes].is_a?(Array) && params[:scopes].all?{ |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }

      files = files.where(scope: params[:scopes])
    end

    if params[:states].present?
      fail "Invalid states" unless params[:states].is_a?(Array) && params[:states].all? { |state| ["closed", "closing", "open"].include?(state) }
      files = files.where(state: params["states"])
    end

    result = files.order(id: :desc).map do |file|
      describe_for_api(file, params[:describe])
    end

    render json: result
  end

  # Inputs
  #
  # scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or leave blank for all
  # note_types (Array, optional): array of valid note_types e.g. ["Note", "Answer", "Discussion"]
  # editable (Boolean, optional): if filtering for only editable_by the context user, otherwise accessible_by
  # describe (object, optional)
  #     fields (array, optional):
  #         Array containing field name [field_1, field_2, ...]
  #         to indicate which object fields to include
  #     include (object, optional)
  #         license (boolean, optional)
  #         user (boolean, optional)
  #         org (boolean, optional)
  #         all_tags_list (boolean, optional)
  #
  # Outputs:
  #
  # An array of hashes
  #
  def list_notes
    if params[:editable]
      notes = Note.editable_by(@context).where.not(title: nil)
    else
      notes = Note.accessible_by(@context).where.not(title: nil)
    end

    if params[:scopes].present?
      fail "Scopes can only be an Array of Strings that are one of public, private or a space-xxxx id." unless params[:scopes].is_a?(Array) && params[:scopes].all?{ |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }

      notes = notes.where(scope: params[:scopes])
    end

    if params[:note_types].present?
      fail "Param note_types can only be an Array of Strings containing 'Note', 'Answer', or 'Discussion'" unless params[:note_types].is_a?(Array) && params[:note_types].all?{ |type| ["Note", "Answer", "Discussion"].include?(type) }

      note_types = params[:note_types].map {|type| type == "Note" ? nil : type}
      notes = notes.where(note_type: note_types)
    end

    result = notes.order(id: :desc).map do |note|
      if note.note_type == "Discussion"
        note = note.discussion
      elsif note.note_type == "Answer"
        note = note.answer
      end
      describe_for_api(note, params[:describe])
    end

    render json: result
  end

  # Inputs
  #
  # scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or leave blank for all
  # editable (Boolean, optional): if filtering for only editable_by the context user, otherwise accessible_by
  # describe (object, optional)
  #     fields (array, optional):
  #         Array containing field name [field_1, field_2, ...]
  #         to indicate which object fields to include
  #     include (object, optional)
  #         license (boolean, optional)
  #         user (boolean, optional)
  #         org (boolean, optional)
  #         all_tags_list (boolean, optional)
  #
  # Outputs:
  #
  # An array of hashes
  #
  def list_comparisons
    # TODO: sync comparisons?
    if params[:editable]
      comparisons = Comparison.editable_by(@context)
    else
      comparisons = Comparison.accessible_by(@context)
    end

    if params[:scopes].present?
      fail "Scopes can only be an Array of Strings that are one of public, private or a space-xxxx id." unless params[:scopes].is_a?(Array) && params[:scopes].all?{ |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }

      comparisons = comparisons.where(scope: params[:scopes])
    end

    result = comparisons.order(id: :desc).map do |comparison|
      describe_for_api(comparison, params[:describe])
    end

    render json: result
  end

  # Inputs
  #
  # scopes (Array, optional): array of valid scopes on the App e.g. ["private", "public", "space-1234"] or leave blank for all
  # editable (Boolean, optional): if filtering for only editable_by the context user, otherwise accessible_by
  # describe (object, optional)
  #     fields (array, optional):
  #         Array containing field name [field_1, field_2, ...]
  #         to indicate which object fields to include
  #     include (object, optional)
  #         license (boolean, optional)
  #         user (boolean, optional)
  #         org (boolean, optional)
  #         all_tags_list (boolean, optional)
  #
  # Outputs:
  #
  # An array of hashes
  #
  def list_apps
    if params[:editable]
      app_series = AppSeries.editable_by(@context)
    else
      app_series = AppSeries.accessible_by(@context)
    end

    apps = app_series.order(id: :desc).map { |s| s.latest_accessible(@context) }.reject(&:nil?)

    # The scope applies to the App and not the AppSeries
    if params[:scopes].present?
      fail "Scopes can only be an Array of Strings that are one of public, private or a space-xxxx id." unless params[:scopes].is_a?(Array) && params[:scopes].all?{ |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }
      apps = apps.reject {|a| !params[:scopes].include?(a.scope)}
    end

    result = apps.map do |app|
      describe_for_api(app, params[:describe])
    end

    render json: result
  end

  # Inputs
  #
  # scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or leave blank for all
  # editable (Boolean, optional): if filtering for only editable_by the context user, otherwise accessible_by
  # describe (object, optional)
  #     fields (array, optional):
  #         Array containing field name [field_1, field_2, ...]
  #         to indicate which object fields to include
  #     include (object, optional)
  #         license (boolean, optional)
  #         user (boolean, optional)
  #         org (boolean, optional)
  #         all_tags_list (boolean, optional)
  #
  # Outputs:
  #
  # An array of hashes
  #
  def list_jobs
    if params[:editable]
      jobs = Job.editable_by(@context)
    else
      jobs = Job.accessible_by(@context)
    end

    if params[:scopes].present?
      fail "Scopes can only be an Array of Strings that are one of public, private or a space-xxxx id." unless params[:scopes].is_a?(Array) && params[:scopes].all?{ |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }
      jobs = jobs.where(scope: params[:scopes])
    end

    result = jobs.order(id: :desc).map do |job|
      describe_for_api(job, params[:describe])
    end

    render json: result
  end

  # Inputs
  #
  # ids (array:string, optional): the dxids of the assets
  # scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or leave blank for all
  # editable (Boolean, optional): if filtering for only editable_by the context user, otherwise accessible_by
  # describe (object, optional)
  #     fields (array, optional):
  #         Array containing field name [field_1, field_2, ...]
  #         to indicate which object fields to include
  #     include (object, optional)
  #         license (boolean, optional)
  #         user (boolean, optional)
  #         org (boolean, optional)
  #         all_tags_list (boolean, optional)
  #
  # Outputs:
  #
  # An array of hashes
  #
  def list_assets
    # Refresh state of assets, if needed
    User.sync_assets!(@context)

    ids = params[:ids]
    if params[:editable]
      assets = Asset.closed.editable_by(@context)
    else
      assets = Asset.closed.accessible_by(@context)
    end

    if !ids.nil?
      fail "The 'ids' parameter needs to be an Array of String asset ids" unless ids.is_a?(Array) && ids.all? { |id| id.is_a?(String) }
      assets = assets.where(dxid: ids)
    end

    if params[:scopes].present?
      fail "Scopes can only be an Array of Strings that are one of public, private or a space-xxxx id." unless params[:scopes].is_a?(Array) && params[:scopes].all?{ |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }
      assets = assets.where(scope: params[:scopes])
    end

    result = assets.order(:name).map do |asset|
      describe_for_api(asset, params[:describe])
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
  # uid (string, required): the uid of the item to describe
  # describe (object, optional)
  #     fields (array, optional):
  #         Array containing field name [field_1, field_2, ...]
  #         to indicate which object fields to include
  #     include (object, optional)
  #         license (boolean, optional)
  #         user (boolean, optional)
  #         org (boolean, optional)
  #         all_tags_list (boolean, optional)
  #
  # Outputs:
  #
  # id (integer)
  # uid (string)
  # describe (object)
  #
  def describe
    # Item id should be a string
    uid = params[:uid]
    fail "The parameter 'uid' should be of type String" unless uid.is_a?(String) && uid != ""

    item = item_from_uid(uid)

    render json: describe_for_api(item, params[:describe])
  end

  # Inputs:
  #
  # license_ids (array of license ids, required, nonempty): licenses to accept
  #
  # Outputs:
  #
  # accepted_licenses: license_ids (same as input)
  #
  def accept_licenses
    license_ids = params["license_ids"]
    fail "License license_ids needs to be an Array of Integers" unless license_ids.is_a?(Array) && license_ids.all? { |license_id|
      license_id.is_a?(Numeric) && (license_id.to_i == license_id)} && !license_ids.empty?
    license_ids.uniq!
    fail "Some license_ids do not exist" unless License.where(id: license_ids).count == license_ids.count

    AcceptedLicense.transaction do
      license_ids.each do |license_id|
        AcceptedLicense.find_or_create_by(license_id: license_id, user_id: @context.user_id)
      end
    end

    render json: { accepted_licenses: license_ids }
  end

  # Use this to associate multiple items to a license
  #
  # Inputs
  #
  # license_id (integer, required)
  # items_to_license (Array[string], required): array of object uids
  #
  # Outputs:
  #
  # license_id (integer)
  # items_licensed (Array[string]): array of object uids attached to license
  #
  def license_items
    license_id = params["license_id"]
    fail "License license_id needs to be an Integer" unless license_id.is_a?(Numeric) && (license_id.to_i == license_id)

    # Check if the license exists and is editable by the user. Throw 404 if otherwise.
    License.editable_by(@context).find(license_id)

    items_to_license = params["items_to_license"]
    fail "License items_o_license needs to be an Array of Strings" unless items_to_license.is_a?(Array) && items_to_license.all? { |item|
      item.is_a?(String) }

    items_licensed = []
    LicensedItems.transaction do
      items_to_license.each do |item_uid|
        item = item_from_uid(item_uid)
        if item.editable_by(@context) && ["asset", "file"].include?(item.klass)
          items_licensed << LicensedItems.find_or_create_by(license_id: license_id, licenseable: item).uid
        end
      end
    end

    render json: { license_id: license_id, items_licensed: items_licensed }
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
    name = params[:name]
    fail "File name needs to be a non-empty String" unless name.is_a?(String) && name != ""

    description = params["description"]
    if !description.nil?
      fail "File description needs to be a String" unless description.is_a?(String)
    end

    project = @context.user.private_files_project
    dxid = DNAnexusAPI.new(@context.token).("file", "new", {"name": params[:name], "project": project})["id"]

    UserFile.transaction do
      UserFile.create!(
        dxid: dxid,
        project: project,
        name: name,
        state: "open",
        description: description,
        user_id: @context.user_id,
        parent: @context.user,
        scope: 'private'
      )
    end

    render json: {id: dxid}
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
  def create_image_file
    name = params[:name]
    fail "File name needs to be a non-empty String" unless name.is_a?(String) && name != ""

    description = params["description"]
    if !description.nil?
      fail "File description needs to be a String" unless description.is_a?(String)
    end

    project = @context.user.private_files_project
    dxid = DNAnexusAPI.new(@context.token).("file", "new", {"name": params[:name], "project": project})["id"]

    UserFile.transaction do
      UserFile.create!(
        dxid: dxid,
        project: project,
        name: name,
        state: "open",
        description: description,
        user_id: @context.user_id,
        parent: @context.user,
        scope: 'private'
      )
    end

    render json: {id: dxid}
  end

  def get_file_link
    error = false

    # Allow assets as well, thought not currently exposed in the UI
    file = UserFile.accessible_by(@context).find_by!(dxid: params[:id])

    # Refresh state of file, if needed
    if file.state != "closed"
      if file.parent_type == "Asset"
        User.sync_asset!(@context, file.id)
      else
        User.sync_file!(@context, file.id)
      end
      file.reload
    end

    if file.state != "closed"
      error = "Files can only be downloaded if they are in the 'closed' state"
      errorType = "FileNotClosed"
    elsif file.license.present? && !file.licensed_by?(@context)
      error = "You must accept the license before you can get the download link"
      errorType = "LicenseError"
    else
      # FIXME:
      # The API warns against storing the url as it may contain
      # auth information that we don't want to expose
      # So we may have to store a reference to the file and generate
      # a shorter duration url each time it is rendered

      opts = {project: file.project, preauthenticated: true, filename: file.name, duration: 300}
      url = DNAnexusAPI.new(@context.token).call(file.dxid, "download", opts)["url"]
    end

    if error
      render json: {error: error, errorType: errorType}
    else
      render json: {id: file.dxid, url: url}
    end
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
    name = params[:name]
    fail "Asset name needs to be a non-empty String" unless name.is_a?(String) && name != ""
    fail "Asset name should end with .tar or .tar.gz" unless ((name.end_with?(".tar") && name.size > ".tar".size) || (name.end_with?(".tar.gz") && name.size > ".tar.gz".size))

    description = params["description"]
    if !description.nil?
      fail "Asset description needs to be a String" unless description.is_a?(String)
    end

    paths = params["paths"]
    fail "Asset paths needs to be a non-empty Array less than 100000 size" unless paths.is_a?(Array) && !paths.empty? && paths.size < 100000
    paths.each do |path|
      fail "Asset path should be a non-empty String of size less than 4096" unless path.is_a?(String) && path != "" && path.size < 4096
    end

    project = User.find(@context.user_id).private_files_project
    dxid = DNAnexusAPI.new(@context.token).("file", "new", {"name": params[:name], "project": project})["id"]

    Asset.transaction do
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
    size = params[:size]
    fail "Parameter 'size' needs to be a Fixnum" unless size.is_a?(Fixnum)

    md5 = params[:md5]
    fail "Parameter 'md5' needs to be a String" unless md5.is_a?(String)

    index = params[:index]
    fail "Parameter 'index' needs to be a Fixnum" unless index.is_a?(Fixnum)

    id = params[:id]
    fail "Parameter 'id' needs to be a non-empty String" unless id.is_a?(String) && id != ""

    # Check that the file exists, is accessible by the user, and is in the open state. Throw 404 if otherwise.
    UserFile.find_by!(dxid: id, state: "open", user_id: @context.user_id)

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
    id = params[:id]
    fail "id needs to be a non-empty string" unless id.is_a?(String) && id != ""

    file = UserFile.find_by!(dxid: id, user_id: @context.user_id, parent_type: "User")
    if file.state == "open"
      DNAnexusAPI.new(@context.token).(id, "close")
      UserFile.transaction do
        # Must recheck inside the transaction
        file.reload
        if file.state == "open"
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
    id = params[:id]
    fail "id needs to be a non-empty String" unless id.is_a?(String) && id != ""

    file = Asset.find_by!(dxid: id, user_id: @context.user_id)
    if file.state == "open"
      DNAnexusAPI.new(@context.token).(id, "close")
      UserFile.transaction do
        # Must recheck inside the transaction
        file.reload
        if file.state == "open"
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
    # Parameter 'id' should be of type String
    id = params[:id]
    fail "App ID is not a string" unless id.is_a?(String) && id != ""

    # Name should be a nonempty string
    name = params[:name]
    fail "Name should be a non-empty string" unless name.is_a?(String) && name != ""

    # Inputs should be a hash (more checks later)
    inputs = params["inputs"]
    fail "Inputs should be a hash" unless inputs.is_a?(Hash)

    # App should exist and be accessible
    @app = App.accessible_by(@context).find_by!(dxid: id)

    # Check if asset licenses have been accepted
    fail "Asset licenses must be accepted" unless @app.assets.all? { |a| !a.license.present? || a.licensed_by?(@context) }

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
        fail "#{key}: required input is missing"
      end

      # Check compatibility with choices
      fail "#{key}: incompatiblity with choices" if choices.present? && !choices.include?(value)

      if klass == "file"
        fail "#{key}: input file value is not a string" unless value.is_a?(String)
        file = UserFile.real_files.accessible_by(@context).find_by(dxid: value)
        fail "#{key}: input file is not accessible or does not exist" unless !file.nil?
        fail "#{key}: input file's license must be accepted" unless !file.license.present? || file.licensed_by?(@context)

        dxvalue = {"$dnanexus_link" => value}
        input_file_dxids << value
      elsif klass == "int"
        fail "#{key}: value is not an integer" unless value.is_a?(Numeric) && (value.to_i == value)
        value = value.to_i
      elsif klass == "float"
        fail "#{key}: value is not a float" unless value.is_a?(Numeric)
      elsif klass == "boolean"
        fail "#{key}: value is not a boolean" unless value == true || value == false
      elsif klass == "string"
        fail "#{key}: value is not a string" unless value.is_a?(String)
      end

      run_inputs[key] = value
      dx_run_input[key] = dxvalue || value
    end

    # User can override the instance type
    if params.has_key?("instance_type")
      fail "Invalid instance type selected" unless Job::INSTANCE_TYPES.has_key?(params["instance_type"]) #Checks also that it's a string
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
      scope: "private",
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

    Job.transaction do
      job = Job.create!(opts)
      job.input_file_ids = input_file_ids
      job.save!
    end

    render json: {id: jobid}
  end

  # Inputs
  #
  # app_id
  #
  # Outputs
  #
  # json (string, only on success): spec, ordered_assets, and packages of the specified app
  def get_app_spec
    # App should exist and be accessible
    app = App.accessible_by(@context).find_by(dxid: params[:id])
    fail "Invalid app id" if app.nil?

    render json: {spec: app.spec, assets: app.ordered_assets, packages: app.packages}
  end

  # Inputs
  #
  # app_id
  #
  # Outputs
  #
  # plain text (string, only on success): code for the specified app
  def get_app_script
    # App should exist and be accessible
    app = App.accessible_by(@context).find_by(dxid: params[:id])
    fail "Invalid app id" if app.nil?

    render plain: app.code
  end

  def export_app
    # App should exist and be accessible
    app = App.accessible_by(@context).find_by(dxid: params[:id])
    fail "Invalid app id" if app.nil?

    # Assets should be accessible and licenses accepted
    fail "One or more assets are not accessible by the current user." if app.assets.accessible_by(@context).count != app.assets.count
    fail "One or more assets need to be licensed. Please run the app first in order to accept the licenses." if app.assets.any? { |a| a.license.present? && !a.licensed_by?(@context) }

    render json: {content: app.to_docker(@context.token)}
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
    name = params[:name]
    fail "The app 'name' must be a nonempty string." unless name.is_a?(String) && name != ""
    fail "The app 'name' can only contain the characters A-Z, a-z, 0-9, '.' (period), '_' (underscore) and '-' (dash)." unless name =~ /^[a-zA-Z0-9._-]+$/

    title = params[:title]
    fail "The app 'title' must be a nonempty string." unless title.is_a?(String) && title != ""

    readme = params[:readme]
    fail "The app 'Readme' must be a string." unless readme.is_a?(String)

    internet_access = params[:internet_access]
    fail "The app 'Internet Access' must be a boolean, true or false." unless ((internet_access == true) || (internet_access == false))

    instance_type = params[:instance_type]
    fail "The app 'instance type' must be one of: #{Job::INSTANCE_TYPES.keys.join(', ')}." unless Job::INSTANCE_TYPES.include?(instance_type)

    ordered_assets = params[:ordered_assets] || []
    fail "The app 'assets' must be an array of asset ids (strings)." unless ordered_assets.is_a?(Array) && ordered_assets.all? { |a| a.is_a?(String) }

    packages = params[:packages] || []
    fail "The app 'packages' must be an array of package names (strings)." unless packages.is_a?(Array) && packages.all? { |a| a.is_a?(String) }

    packages.sort!.uniq!

    packages.each do |package|
      fail "The package '#{package}' is not a valid Ubuntu package." unless App::UBUNTU_PACKAGES.bsearch { |p| package <=> p }
    end

    code = params[:code]
    fail "The app 'code' must be a string." unless code.is_a?(String)

    is_new = params["is_new"] == true

    input_spec = params[:input_spec] || []
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

    output_spec = params[:output_spec] || []
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
    prefix = params[:prefix]
    fail "Prefix should be a String of at least 3 characters" unless prefix.is_a?(String) && prefix.size >= 3

    ids = Asset.closed.accessible_by(@context).with_search_keyword(prefix).order(:name).select(:dxid).distinct.limit(1000).map(&:dxid)
    render json: { ids: ids }
  end

  # Use this to add multiple items of the same type to a note
  # or multiple notes to an item
  # Inputs
  #
  # note_uids (Array[String], required): array of note, discussion, answer uids
  # item (Array[Object], required): array of items with id, type
  #     item.type (String): type of string from App, Comparison, Job, or UserFile
  #
  # Outputs:
  #
  # notes_added (Array[String])
  # items_added (Array[Integer])
  #
  def attach_to_notes
    note_uids = params[:note_uids]
    fail "Parameter 'note_uids' need to be an Array of Note, Answer, or Discussion uids" unless note_uids.is_a?(Array) && note_uids.all? { |uid| uid =~ /^(note|discussion|answer)-(\d+)$/ }

    items = params[:items]
    fail "Items need to be an array of objects with id and type (one of App, Comparison, Job, or UserFile)" unless items.is_a?(Array) && items.all? { |item| item[:id].is_a?(Numeric) && item[:type].is_a?(String) && ["App", "Comparison", "Job", "UserFile"].include?(item[:type])}

    notes_added = {}
    items_added = {}
    Note.transaction do
      note_uids.each do |note_uid|
        note_item = item_from_uid(note_uid)
        if !note_item.nil? && note_item.editable_by?(@context)
          items.each do |item|
            item[:type] = item[:type].present? ? item[:type] : type_from_classname(item[:className])
            note_item.attachments.find_or_create_by(item_id: item[:id], item_type: item[:type])
            items_added["#{item[:type]}-#{item[:id]}"] = true
          end
          notes_added[note_uid] = true
          note_item.save
        end
      end
    end

    render json: {
      notes_added: notes_added,
      items_added: items_added
    }
  end

  # Inputs
  #
  # id (integer, required): the id of the submission to be updated
  # title (string): the updated submission title
  # content (string): the updated submission description
  #
  # Outputs:
  # id: the submission id
  #
  def update_submission
    id = params[:id].to_i
    fail "id needs to be an Integer" unless id.is_a?(Integer)

    title = params[:title]
    fail "title needs to be a String" unless title.is_a?(String)

    content = params[:content] || ""
    fail "content needs to be a String" unless content.is_a?(String)

    submission = nil
    Submission.transaction do
      submission = Submission.editable_by(@context).find(params[:id])
      fail "no submission found" unless submission
      submission.update!(desc: content)
      submission.job.update!(name: title)
    end

    render json: {
      id: submission.id
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
    fail "id needs to be an Integer" unless id.is_a?(Integer)

    title = params[:title]
    fail "title needs to be a String" unless title.is_a?(String)

    content = params[:content] || ""
    fail "content needs to be a String" unless content.is_a?(String)

    attachments_to_save = params[:attachments_to_save] || []
    fail "attachments_to_save needs to be an array" unless attachments_to_save.is_a?(Array)

    attachments_to_delete = params[:attachments_to_delete] || []
    fail "attachments_to_delete neeeds to be an array" unless attachments_to_delete.is_a?(Array)

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

  # Inputs
  #
  # uid (string, required): the uid of the item to upvote
  # vote_scope (string, optional)
  #
  # Outputs:
  # uid (string): the uid of the item
  # upvote_count (integer): latest upvote count for item
  #
  def upvote
    uid = params[:uid]
    fail "Item uid needs to be a non-empty string" unless uid.is_a?(String) && uid != ""

    vote_scope = params[:vote_scope]

    item = item_from_uid(uid)
    if item.accessible_by?(@context) && ["app-series", "discussion", "answer", "note", "comparison", "job", "file", "asset"].include?(item.klass)
      if vote_scope.present?
        # Special treatment for appathon vote_scope
        if vote_scope =~ /^(appathon)-(\d+)$/
          appathon = item_from_uid(vote_scope, Appathon)
          fail "#{uid} is not accessible by you in this scope" unless appathon.followed_by?(@context.user)
        end
        item.liked_by(@context.user, vote_scope: vote_scope)
        upvote_count = item.get_upvotes(vote_scope: vote_scope).size
      else
        item.liked_by(@context.user)
        upvote_count = item.get_upvotes.size
      end
      render json: {
        uid: uid,
        upvote_count: upvote_count
      }
    else
      fail "#{uid} is not accessible by you"
    end
  end

  # Inputs
  #
  # uid (string, required): the uid of the item to remove an upvote
  # vote_scope (string, optional)
  #
  # Outputs:
  # uid (string): the uid of the item
  # upvote_count (integer): latest upvote count for item
  #
  def remove_upvote
    uid = params[:uid]
    fail "Item uid needs to be a non-empty string" unless uid.is_a?(String) && uid != ""

    vote_scope = params[:vote_scope]

    item = item_from_uid(uid)
    if item.accessible_by?(@context) && ["app-series", "discussion", "answer", "note", "comparison", "job", "file", "asset"].include?(item.klass)
      if vote_scope.present?
        # Special treatment for appathon vote_scope
        if vote_scope =~ /^(appathon)-(\d+)$/
          appathon = item_from_uid(vote_scope, Appathon)
          fail "#{uid} is not accessible by you in this scope" unless appathon.followed_by?(@context.user)
        end
        item.unliked_by(@context.user, vote_scope: vote_scope)
        upvote_count = item.get_upvotes(vote_scope: vote_scope).size
      else
        item.unliked_by(@context.user)
        upvote_count = item.get_upvotes.size
      end
      render json: {
        uid: uid,
        upvote_count: upvote_count
      }
    else
      fail "#{uid} is not accessible by you"
    end
  end

  # Inputs
  #
  # followable_uid (string, required): the uid of the item to follow
  #
  # Outputs:
  # followable_uid (string): the uid of the item followed
  # follower_uid (string): the uid of the follower
  # follow_count (integer): latest count of follows on the followable item
  #
  def follow
    followable_uid = params["followable_uid"]
    fail "Followable uid needs to be a non-empty string" unless followable_uid.is_a?(String) && followable_uid != ""

    followable = item_from_uid(followable_uid)
    follower = @context.user
    if followable.accessible_by?(@context) && ["discussion","challenge"].include?(followable.klass)
      follower.follow(followable)
      render json: {
        followable_uid: followable_uid,
        follower_uid: follower.uid,
        follow_count: followable.followers_by_type_count(follower.class.name)
      }
    else
      fail "You do not have permission to follow this object"
    end
  end

  # Inputs
  #
  # follow_uid (string, required): the uid of the item to unfollow
  #
  # Outputs:
  # follow_uid (string): the uid of the item unfollowed
  # follower_uid (string): the uid of the follower
  # follow_count (integer): latest count of follows on the followable item
  #
  def unfollow
    followable_uid = params["followable_uid"]
    fail "Followable uid needs to be a non-empty string" unless followable_uid.is_a?(String) && followable_uid != ""

    followable = item_from_uid(followable_uid)
    follower = @context.user
    if followable.accessible_by?(@context) && ["discussion"].include?(followable.klass)
      follower.stop_following(followable)
      render json: {
        followable_uid: followable_uid,
        follower_uid: follower.uid,
        follow_count: followable.followers_by_type_count(follower.class.name)
      }
    else
      fail "You do not have permission to unfollow this object"
    end
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
