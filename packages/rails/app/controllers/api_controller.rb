# rubocop:todo Style/SignalException
class ApiController < ApplicationController
  include ErrorProcessable
  include WorkflowConcern
  include FilesConcern
  include UidFindable
  include ApiExceptionHandler
  include CloudResourcesConcern

  rescue_from HttpsAppsClient::Error do |exception|
    render status: :service_unavailable, json: { error: { message: exception.message, statusCode: 503 } }
  end

  skip_before_action :require_login
  skip_before_action :verify_authenticity_token, unless: lambda {
    @context.present? && @context.key?(:cli_client) && @context[:cli_client] == true
  }
  # rubocop:todo Rails/LexicallyScopedActionFilter
  before_action :require_api_login,
                except: %i(
                  destroy
                  list_apps
                  list_assets
                  list_comparisons
                  list_files
                  list_jobs
                  list_workflows
                  list_notes
                  list_related
                  describe
                  search_assets
                  cli_latest_version
                )
  # rubocop:enable Rails/LexicallyScopedActionFilter
  before_action :require_api_login_or_guest,
                only: %i(
                  list_apps
                  list_assets
                  list_comparisons
                  list_files
                  list_jobs
                  list_workflows
                  list_related
                  describe
                  search_assets
                )
  before_action :validate_create_asset, only: :create_asset
  before_action :check_total_and_job_charges_limit, only: %i(run_workflow)
  before_action :check_total_charges_limit, only: %i(create_file create_asset)
  before_action :validate_create_file, only: :create_file
  before_action :validate_get_upload_url, only: :get_upload_url

  rescue_from ApiError, with: :render_error_method

  attr_accessor :show_count
  attr_writer :context

  # A common method to add Objects count into api response
  # @param count [Integer] Object's count
  # @return Object { count: Object's count }
  def count(count)
    { count: count }
  end

  # Inputs
  #
  # workflow_id (string, required): the dxid of the workflow to run
  # inputs (hash, required): the inputs
  # name (string, required): the name of the analysis
  #
  # Outputs
  #
  # id (string, only on success): the id of the created analysis, if success
  # failure (string, only on failure): a message that can be shown to the user due to failure
  def run_workflow
    analysis_dxid = run_workflow_once(unsafe_params)

    render json: { id: analysis_dxid }
  end

  def to_bool(input)
    return true   if input == 'true'
    return false  if input == 'false'
    raise ArgumentError.new("invalid value for Boolean: \"#{self}\"")
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
    uid = unsafe_params[:uid]
    item = item_from_uid(uid)

    if item.accessible_by?(@context)
      unsafe_params[:opts] = unsafe_params[:opts].is_a?(Hash) ? unsafe_params[:opts] : {}

      scopes = unsafe_params[:opts][:scopes]
      unless scopes.nil?
        fail "Option 'scopes' can only be an Array of Strings that are one of public, private or a space-xxxx id." unless scopes.is_a?(Array) && scopes.all? { |s| s == 'public' || s == 'private' || s =~ /^space-(\d+)$/ }
      end

      classes = unsafe_params[:opts][:classes]
      unless classes.nil?
        fail "Option 'classes' can be undefined or an array of strings" unless classes.is_a?(Array) && classes.all? { |k| k.is_a?(String) }
      end

      scoped_items = lambda do |scoped_item, scopes_override = false|
        unless scopes.nil?
          scope_query = scopes_override ? scopes_override : { scope: scopes }
          scoped_item = scoped_item.where(scope_query)
        end
        scoped_item = if unsafe_params[:opts][:editable]
          scoped_item.editable_by(@context)
        else
          scoped_item.accessible_by(@context)
        end

        return scoped_item.to_a
      end

      allow_klass = lambda do |klass|
        return classes.nil? || classes.include?(klass)
      end

      related = []
      case item.klass
      when "file"
        related.push(*scoped_items.call(item.notes.real_notes)) if allow_klass.call("note")
        related.push(*scoped_items.call(item.comparisons)) if allow_klass.call("comparison")
        if item.parent_type == "Job"
          related.push(*scoped_items.call(Job.where(id: item.parent_id))) if allow_klass.call("job")
        end
      when "note", "answer", "discussion"
        if item.klass == "discussion"
          scopes_override = !scopes.nil? ? { notes: { scope: scopes } } : false
          related.push(*scoped_items.call(item.answers.joins(:note), scopes_override)) if allow_klass.call("answer")
        end
        note = if item.klass != "note"
          item.note
        else
          item
        end
        related.push(*scoped_items.call(note.comparisons)) if allow_klass.call("comparison")
        related.push(*scoped_items.call(note.real_files)) if allow_klass.call("file")
        related.push(*scoped_items.call(note.apps)) if allow_klass.call("app")
        related.push(*scoped_items.call(note.jobs)) if allow_klass.call("job")
        related.push(*scoped_items.call(note.assets)) if allow_klass.call("asset")
      when "app"
        related.push(*scoped_items.call(item.notes.real_notes)) if allow_klass.call("note")
        related.push(*scoped_items.call(item.jobs)) if allow_klass.call("job")
        related.push(*scoped_items.call(item.assets)) if allow_klass.call("asset")
      when "job"
        related.push(*scoped_items.call(App.where(id: item.app_id))) if allow_klass.call("app")
        related.push(*scoped_items.call(item.notes.real_notes)) if allow_klass.call("note")
        related.push(*scoped_items.call(item.input_files)) if allow_klass.call("file")
        related.push(*scoped_items.call(item.output_files)) if allow_klass.call("file")
      when "asset"
      when "comparison"
        related.push(*scoped_items.call(item.notes.real_notes)) if allow_klass.call("file")
        related.push(*scoped_items.call(item.user_files)) if allow_klass.call("file")
      when "license"
      when "space"
      when "workflow"
        related.push(*scoped_items.call(item.apps)) if allow_klass.call("app")
        related.push(*scoped_items.call(item.jobs)) if allow_klass.call("job")
      else
        fail "Unknown class #{item.klass}"
      end

      related = related.uniq.map { |o| describe_for_api(o, unsafe_params[:opts][:describe]) }

      render json: related
    else
      fail "You do not have permission to access #{id}"
    end
  end

  # Inputs:
  #
  # parent_folder_id (integer): primary key of the folder selected;
  #                             for root folder parent_folder_id = nil
  # scoped_parent_folder_id (integer): used in spaces scopes only;
  #                             primary key of the folder selected;
  #                             for root folder parent_folder_id = nil
  # scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or leave blank for all
  #
  # Outputs:
  #
  # An array of hashes, each of which has these fields:
  # id (integer): primary key of the file or the folder
  # name (string): the filename or the folder name
  # type (string): file or folder sti_type, "UserFile" or "Folder"
  # uid (string): the file's unique id (file-xxxxxx); for any folder uid = nil
  #
  def folder_tree
    parent_folder_id =
      unsafe_params[:parent_folder_id] == "" ? nil : unsafe_params[:parent_folder_id].to_i
    scoped_parent_folder_id =
      unsafe_params[:scoped_parent_folder_id] == "" ? nil : unsafe_params[:scoped_parent_folder_id].to_i

    if unsafe_params[:scopes].present?
      check_scope!
      # exclude 'public' scope
      if unsafe_params[:scopes].first =~ /^space-(\d+)$/
        spaces_members_ids = Space.spaces_members_ids(unsafe_params[:scopes])
        spaces_params = {
          context: @context,
          spaces_members_ids: spaces_members_ids,
          scopes: unsafe_params[:scopes],
          scoped_parent_folder_id: scoped_parent_folder_id,
        }
        files = UserFile.batch_space_files(spaces_params)
        folders = Folder.batch_space_folders(spaces_params)
      else
        files = UserFile.batch_private_files(@context, ["private", nil], parent_folder_id)
        folders = Folder.batch_private_folders(@context, parent_folder_id)
      end
    end

    folder_tree = []
    Node.folder_content(files, folders).each do |item|
      folder_tree << {
        id: item[:id],
        name: item[:name],
        type: item[:sti_type],
        uid: item[:uid],
        scope: item[:scope],
      }
    end

    render json: folder_tree
  end

  # Return files array found by RegEx
  # @param search_string [String] Search string.
  # @param flag [String] Regex flag.
  # @param page [Integer] Current page number.
  # @param order_by_name [String] Order direction: 'asc' or 'desc'.
  # @param uids [Nil, True] Uids of files checked.
  # @return search_result [Array<Hash>]
  #  array of hashes, each of which has these fields:
  #    id (integer): primary key of the file
  #    uid (strinf): string key of the file
  #    title (string): the file name
  #    path (string): a file path collected
  #     search_result is a sorted array, according params[:order_by_name] value
  #     It consists of folders part if any and a files part.
  #     Files inside folders are also sorted.
  #  uids: array of all found file's uid values
  #
  def files_regex_search
    page = params[:page].to_i.positive? ? params[:page] : 1
    files = user_real_files(params, @context).files_conditions
    begin
      regexp = Regexp.new(Regexp.escape(params[:search_string]), params[:flag])
      direction = params[:order_by_name]

      search_result = files.
        eager_load(:license, user: :org).
        order(name: direction.to_s).
        map do |file|
          describe_for_api(file) if file.name.downcase.scan(regexp).present?
        end

      result = []
      if search_result.compact.present?
        result = UserFile.files_search_results(search_result, direction)
      end

      paginated_result = Kaminari.paginate_array(result).page(page).per(20)
      uids = params[:uids].present? && to_bool(params[:uids]) ? result.compact.pluck(:uid) : []

      render json: { search_result: paginated_result, uids: uids }
    rescue RegexpError => e
      fail "RegEx Invalid: #{e}"
    end
  end

  # Inputs:
  #
  # states (array of strings; optional): the file state/s to be returned "closed", "closing",
  #   and/or "open"
  # scopes (Array, optional): array of valid scopes e.g. ["private", "public", "space-1234"] or
  #   leave blank for all
  # editable (Boolean, optional): if filtering for only editable_by the context user,
  #   otherwise accessible_by
  # search_string (string, optional): if specified, file names are matched to this string
  #   (wildcard on both ends)
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
    files = user_real_files(params, @context)

    if unsafe_params[:limit] && unsafe_params[:offset]
      files = files.limit(unsafe_params[:limit]).offset(unsafe_params[:offset])
    end

    search_string = params[:search_string].presence || ""

    query = files.eager_load(:license, user: :org).
      where("nodes.name LIKE ?", "%#{search_string}%")

    query = query.where.not("users.dxuser = ?", CHALLENGE_BOT_DX_USER) if unsafe_params[:ignore_challenge_bot]

    result = query.order(Arel.sql("CASE WHEN nodes.scope = 'private' THEN 0 ELSE 1 END, nodes.id DESC")).map do |file|
      describe_for_api(file, unsafe_params[:describe])
    end.compact

    render json: unsafe_params[:offset]&.zero? ? { objects: result, count: result.length } : result
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
    notes = if unsafe_params[:editable]
      Note.editable_by(@context).where.not(title: nil).accessible_by_private
    else
      Note.accessible_by(@context).where.not(title: nil)
    end

    if unsafe_params[:scopes].present?
      check_scope!
      notes = notes.where(scope: unsafe_params[:scopes])
    end

    if unsafe_params[:note_types].present?
      fail "Param note_types can only be an Array of Strings containing 'Note', 'Answer', or 'Discussion'" unless unsafe_params[:note_types].is_a?(Array) && unsafe_params[:note_types].all? { |type| %w(Note Answer Discussion).include?(type) }

      note_types = unsafe_params[:note_types].map { |type| type == "Note" ? nil : type }
      notes = notes.where(note_type: note_types)
    end

    result = notes.order(id: :desc).map do |note|
      if note.note_type == "Discussion"
        note = note.discussion
      elsif note.note_type == "Answer"
        note = note.answer
      end
      describe_for_api(note, unsafe_params[:describe])
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
    comparisons = if unsafe_params[:editable]
      Comparison.editable_by(@context).accessible_by_private
    else
      Comparison.accessible_by(@context)
    end

    if unsafe_params[:scopes].present?
      check_scope!
      comparisons = comparisons.where(scope: unsafe_params[:scopes])
    end

    result = comparisons.order(id: :desc).map do |comparison|
      describe_for_api(comparison, unsafe_params[:describe])
    end

    render json: result
  end

  # GET - Returns user accessible list_licenses according to input filters.
  #   Used in license dialogs.
  # @param scopes [Array], optional - array of valid scopes on the licenses,
  #   e.g. ["private", "public", "space-1234"] or leave blank for all
  # @return licenses [License] An array of hashes - License object, with its connected data.
  def list_licenses
    check_scope!
    licenses = License.
      editable_by(@context).
      eager_load(user: :org).
      includes(:taggings).
      order(:title)

    licenses = licenses.where(scope: params[:scopes]) if params[:scopes].present?

    render json: licenses, root: "licenses", adapter: :json
  end

  # Returns user accessible apps according to input filters.
  #   Used in Notes 'Attach to Note' and Spaces 'Add Apps' dialogs.
  #
  # Inputs
  #
  # scopes (Array, optional): array of valid scopes on the App e.g.
  #   ["private", "public", "space-1234"] or leave blank for all
  # editable (Boolean, optional): if filtering for only editable_by the context user,
  #   otherwise accessible_by
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
    check_scope!

    apps = App.accessible_by(@context).unremoved.includes(:app_series).order(:title)
    apps = apps.where(scope: params[:scopes]) if params[:scopes].present?

    # Filter by latest revisions or versions.
    #   This is kinda tricky, but we need to handle the apps which revisions were moved to a space
    #   before we migrated to the new way how app is published to a space.
    apps = apps.select(&:latest_accessible_in_scope?)

    result = apps.map do |app|
      describe_for_api(app, unsafe_params[:describe])
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
  # space_uid (String, optional): if a job is being moved to space with this space_id value.
  #
  # Outputs:
  #
  # An array of hashes
  #

  def list_jobs
    jobs = if unsafe_params[:editable]
      Job.editable_by(@context).accessible_by_private
    else
      Job.accessible_by(@context)
    end

    if unsafe_params[:scopes].present?
      check_scope!
      jobs = jobs.where(scope: unsafe_params[:scopes])
    end

    if unsafe_params[:space_uid].present?
      jobs = jobs.terminal
    end

    result = jobs.eager_load(user: :org).order(id: :desc).map do |job|
      describe_for_api(job, unsafe_params[:describe])
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
    ids = unsafe_params[:ids]
    assets = if unsafe_params[:editable]
      Asset.closed.editable_by(@context).accessible_by_private
    else
      Asset.closed.accessible_by(@context)
    end

    assets = assets.limit(unsafe_params[:limit]) if unsafe_params[:limit]

    unless ids.nil?
      fail "The 'ids' parameter needs to be an Array of String asset ids" unless ids.is_a?(Array) && ids.all? { |id| id.is_a?(String) }
      assets = assets.where(uid: ids)
    end

    if unsafe_params[:scopes].present?
      check_scope!
      assets = assets.where(scope: unsafe_params[:scopes])
    end

    result = assets.order(:name).map do |asset|
      describe_for_api(asset, unsafe_params[:describe])
    end

    unless ids.nil?
      # This would happen if an asset becomes inaccessible
      # For now silently drop the asset -- allows for asset deletion
      # raise unless ids.size == result.size
    end

    render json: result
  end

  def list_workflows
    workflow_series = if unsafe_params[:editable]
      WorkflowSeries.editable_by(@context).accessible_by_private
    else
      WorkflowSeries.accessible_by(@context)
    end

    workflow_series = workflow_series.unremoved.
      eager_load(:latest_revision_workflow).order(id: :desc)
    workflows = workflow_series.map { |series| series.latest_accessible(@context) }.compact

    if unsafe_params[:scopes].present?
      check_scope!
      workflows = workflows.select { |workflow| unsafe_params[:scopes].include?(workflow.scope) }
    end

    result = workflows.map do |workflow|
      describe_for_api(workflow, unsafe_params[:describe])
    end

    render json: result
  end

  # Inputs
  #
  # taggable_uid (string, required): the uid of the item to tag
  # tags (string, required): comma-separated string containing tags to update to,
  #                this will replace existing tags
  # suggested_tags (array[strings], optional): array of tags
  # tag_context (string, optional): indicates the tag context to use
  def set_tags
    taggable_uid = unsafe_params[:taggable_uid]
    taggable_folder_id = unsafe_params[:taggable_folder_id]
    unless taggable_uid.is_a?(String) && taggable_uid != "" || taggable_folder_id != ""
      raise ApiError, "Taggable uid needs to be a non-empty string"
    end

    tags = unsafe_params[:tags]
    raise ApiError, "Tags need to be comma-separated strings" unless tags.is_a?(String)

    suggested_tags = unsafe_params[:suggested_tags] # Optional
    tags = (tags.split(",") + suggested_tags).join(",") if suggested_tags.is_a?(Array)

    tag_context = unsafe_params[:tag_context] # Optional

    taggable = item_from_uid(taggable_uid) if taggable_uid
    taggable = Folder.accessible_by(@context).find_by(id: taggable_folder_id) if taggable_folder_id

    verify_nodes_for_protection([taggable], "set tags") if taggable.is_a?(UserFile)

    can_edit = false
    if Space.valid_scope?(taggable_uid)
      # if taggable is a space, need to pass only user, not whole context - using own method instead of concern.
      can_edit = taggable.editable_by?(@context.user)
    else
      can_edit = taggable.editable_by?(@context)
    end

    if can_edit || @context.can_administer_site?
      path = pathify(taggable)
      message = "redirect to item"
      @context.user.tag(taggable, with: tags, on: tag_context.presence || :tags)
    else
      path = home_path
      message = "This item is not accessible by you"
    end

    render json: { path: path, message: message }
  rescue RuntimeError => e
    raise ApiError, e.message
  end

  def set_properties
    # doesnt work for folders yet. might force FE to send id and type? for spaces and folders we only have id anyway..
    item_id = params[:item_id]
    item_type = params[:type]
    properties = unsafe_params[:properties]
    verify_nodes_for_protection([Node.find_by(id: item_id)], "set properties") if item_type == "node"

    result = https_apps_client.set_properties(item_id.to_i, item_type, properties)
    render json: result
  end

  def get_valid_property_keys
    result = https_apps_client.get_valid_property_keys(params[:type], params[:scope])
    render json: result, adapter: :json
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
    uid = unsafe_params[:uid]
    fail "The parameter 'uid' should be of type String" unless uid.is_a?(String) && uid != ""

    item = item_from_uid(uid)

    render json: describe_for_api(item, unsafe_params[:describe])
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
    license_ids = unsafe_params["license_ids"]
    fail "License license_ids needs to be an Array of Integers" unless license_ids.is_a?(Array) && license_ids.all? do |license_id|
                                                                          license_id.is_a?(Numeric) && (license_id.to_i == license_id)
                                                                        end && !license_ids.empty?
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
    license_id = unsafe_params["license_id"]
    unless license_id.is_a?(Numeric) && (license_id.to_i == license_id) ||
      license_id.is_a?(String) && license_id.to_i.positive?
      raise "License license_id needs to be an Integer"
    end

    # Check if the license exists and is editable by the user. Throw 404 if otherwise.
    License.editable_by(@context).find(license_id)

    items_to_license = unsafe_params["items_to_license"]
    if items_to_license.is_a?(String)
      items_to_license = [items_to_license]
    elsif items_to_license.is_a?(Array) && items_to_license.any? { |item| item.is_a?(String) }
      raise "License items_o_license needs to be an Array of Strings"
    end

    items_licensed = []
    LicensedItem.transaction do
      items_to_license.each do |item_uid|
        item = item_from_uid(item_uid)
        if item.editable_by?(@context) && %w(asset file).include?(item.klass)
          items_licensed << LicensedItem.find_or_create_by(license_id: license_id,
                                                           licenseable: item).id
        end
      end
    end

    render json: { license_id: license_id, items_licensed: items_licensed }
  end

  # Inputs:
  #
  # name (string, required, nonempty)
  # description (string, optional)
  # scope (string, optional) 'public' | 'private' | <SPACE_ID>
  #
  # Outputs:
  #
  # id (string, "file-xxxx")
  #
  def create_file
    project = UserFile.publication_project!(current_user, @scope)

    parent = current_user
    # file could be uploaded by CLi inside job
    if params[:parent_type] == "Job" && params[:parent_id] != ""
      parent = Job.find_by!(dxid: params[:parent_id])
    end

    api = DNAnexusAPI.new(RequestContext.instance.token)
    file_dxid = api.file_new(params[:name], project)["id"]

    file = UserFile.create!(
      dxid: file_dxid,
      project: project,
      name: params[:name],
      state: "open",
      description: params[:description],
      user: current_user,
      parent: parent,
      scope: @scope,
      UserFile.scope_column_name(@scope) => @folder&.id,
    )

    render json: { id: file.uid }
  end

  # Creates a challenge logo - to be visible as a challenge card image
  # @return [Hash] - a uid of a file uploaded as a card image
  #
  def create_challenge_card_image
    return unless current_user.site_or_challenge_admin?

    name = unsafe_params[:name]
    fail "File name needs to be a non-empty String" unless name.is_a?(String) && name != ""

    description = unsafe_params["description"]
    unless description.nil?
      fail "File description needs to be a String" unless description.is_a?(String)
    end

    api = DNAnexusAPI.new(CHALLENGE_BOT_TOKEN)
    project = CHALLENGE_BOT_PRIVATE_FILES_PROJECT
    dxid = api.file_new(unsafe_params[:name], project)["id"]

    file = UserFile.create!(
      dxid: dxid,
      project: project,
      name: name,
      state: "open",
      description: description,
      user_id: User.challenge_bot.id,
      parent: User.challenge_bot,
      scope: "public",
    )

    render json: { uid: file.uid, id: file.id }
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
  def create_challenge_resource
    return unless current_user.site_or_challenge_admin?

    challenge = Challenge.find_by!(id: unsafe_params[:challenge_id])
    unless challenge.editable_by?(@context)
      fail "Challenge cannot be modified by current user."
    end

    name = unsafe_params[:name]
    fail "File name needs to be a non-empty String" unless name.is_a?(String) && name != ""

    description = unsafe_params["description"]
    unless description.nil?
      fail "File description needs to be a String" unless description.is_a?(String)
    end

    project = CHALLENGE_BOT_PRIVATE_FILES_PROJECT
    dxid = DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).call("file", "new", "name": unsafe_params[:name], "project": CHALLENGE_BOT_PRIVATE_FILES_PROJECT)["id"]
    challenge_bot = User.challenge_bot

    UserFile.transaction do
      file = UserFile.create!(
        dxid: dxid,
        project: project,
        name: name,
        state: "open",
        description: description,
        user_id: challenge_bot.id,
        parent: challenge_bot,
        scope: 'private'
      )

      ChallengeResource.create!(
        challenge_id: challenge.id,
        user_file_id: file.id,
        user_id: @context.user_id
      )

      render json: { id: file.uid }
    end
  end

  def create_resource_link
    file = UserFile.where(user_id: User.challenge_bot.id).find_by_uid!(unsafe_params[:id])
    resource = ChallengeResource.find_by!(user_id: @context.user_id, challenge_id: unsafe_params[:challenge_id], user_file_id: file.id)

    unless resource.editable_by?(@context)
      fail "Challenge resource cannot be modified by current user."
    end

    if file.state != "closed"
      render json: {
        error: "Files can only be downloaded if they are in the 'closed' state",
        errorType: "FileNotClosed",
      }
      return
    end

    # FIXME:
    # The API warns against storing the url as it may contain
    # auth information that we don't want to expose
    # So we may have to store a reference to the file and generate
    # a shorter duration url each time it is rendered

    url = DNAnexusAPI.new(CHALLENGE_BOT_TOKEN).generate_permanent_link(file)

    resource.update(url: url)

    render json: { id: file.uid, url: url }
  end

  def get_file_link
    error = false

    # Allow assets as well, thought not currently exposed in the UI
    file = UserFile.accessible_by(@context).find_by_uid!(unsafe_params[:id])

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

      token = if file.created_by_challenge_bot? && current_user.site_or_challenge_admin?
        CHALLENGE_BOT_TOKEN
      else
        @context.token
      end

      opts = { project: file.project, preauthenticated: true, filename: file.name, duration: 9_999_999_999 }
      url = DNAnexusAPI.new(token).call(file.dxid, "download", opts)["url"]
    end

    if error
      render json: { error: error, errorType: errorType }
    else
      render json: { id: file.uid, url: url }
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
    asset = AssetService.create(@context, unsafe_params)

    render json: { id: asset.uid }
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
    url_service = UploadUrlFetcher.new(@context, unsafe_params[:id])

    result = url_service.fetch_url(unsafe_params)

    render json: result
  end

  # Inputs:
  #
  # uid or id (string, required)
  # Both uid or id mean UID of the file
  # id support is present just for backwards compatibility of older clients (such as CLI)
  #
  # Outputs: nothing (empty hash)
  #
  def close_file
    uid = unsafe_params[:uid] || unsafe_params[:id]
    https_apps_client.file_close(uid, unsafe_params)
    render json: {}
  end

  # Inputs:
  #
  # id (string, required)
  #
  # Outputs: nothing (empty hash)
  #
  def close_asset
    # TODO: Deprecate this when moving to node, use classic close_file route instead.
    # This API is still used by the CLI
    id = unsafe_params[:id]
    https_apps_client.file_close(id, unsafe_params)
    render json: {}
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
    app = App.accessible_by(@context).find_by_uid(unsafe_params[:id])
    fail "Invalid app id" if app.nil?

    render json: { spec: app.spec, assets: app.ordered_assets, packages: app.packages }
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
    app = App.accessible_by(@context).find_by_uid(unsafe_params[:id])
    fail "Invalid app id" if app.nil?

    render plain: app.code
  end

  def export_app
    # App should exist and be accessible
    app = App.accessible_by(@context).find_by_uid(unsafe_params[:id])
    fail "Invalid app id" if app.nil?

    # Assets should be accessible and licenses accepted
    fail "One or more assets are not accessible by the current user." if app.assets.accessible_by(@context).count != app.assets.count
    fail "One or more assets need to be licensed. Please run the app first in order to accept the licenses." if app.assets.any? { |a| a.license.present? && !a.licensed_by?(@context) }

    render json: { content: app.to_docker(@context.token) }
  end

  def share_with_fda
    app = App.find(unsafe_params[:id])
    api = DNAnexusAPI.new(@context.token)
    dev_group = Setting.review_app_developers_org

    data = api.call(app.dxid, 'addDevelopers', "developers": [dev_group])
    app.dev_group = dev_group
    app.save!

    respond_to do |r|
      r.json do
        render json: { "app_id": app.id, data: data, dxuser: @context.user.dxuser, owner: app.user.dxuser }
      end
    end
  end

  # Inputs
  #
  # keyword (string, required): the keyword to search for
  #
  # Outputs:
  #
  # the matching assets
  #
  def search_assets
    keyword = unsafe_params[:keyword]

    fail "Prefix should be a String of at least 3 characters" if !keyword.is_a?(String) || keyword.size < 2

    ids = Asset.closed.
      accessible_by(@context).
      with_search_keyword(keyword).
      select(:uid).
      distinct

    assets = Asset.where(uid: ids).limit(unsafe_params[:limit])

    result = assets.order(:name).map do |asset|
      map_basic_asset(asset)
    end

    render json: result
  end

  # Use this to add multiple items of the same type to a note
  # or multiple notes to an item
  # Inputs
  #
  # note_uids (Array[String], required): array of note, discussion, answer uids
  # item (Array[Object], required): array of items with id, type
  #     item.type (String): type of string from App, Comparison, Job, UserFile or Asset
  #
  # Outputs:
  #
  # notes_added (Array[String])
  # items_added (Array[Integer])
  #
  def attach_to_notes
    items = unsafe_params[:items]
    note_uids = unsafe_params[:note_uids]

    unless note_uids.all? { |uid| uid =~ /^(note|discussion|answer)-(\d+)$/ }
      fail "Parameter 'note_uids' need to be an Array of Note, Answer, or Discussion uids"
    end

    valid_items =
      items.all? do |item|
        item[:id].is_a?(Numeric) &&
          item[:type].is_a?(String) &&
          %w(App Asset Comparison Job UserFile).include?(item[:type])
      end

    unless valid_items
      fail "Items need to be an array of objects with id and type " \
           "(one of App, Comparison, Job, UserFile or Asset)"
    end

    notes_added = {}
    items_added = {}

    Note.transaction do
      note_uids.each do |note_uid|
        note_item = item_from_uid(note_uid)

        next unless note_item&.editable_by?(@context)

        items.each do |item|
          item[:type] = if item[:type].blank?
            item[:className] == "file" ? "UserFile" : item[:className].capitalize
          else
            item[:type]
          end

          note_item.attachments.find_or_create_by(item_id: item[:id], item_type: item[:type])
          items_added["#{item[:type]}-#{item[:id]}"] = true
        end

        notes_added[note_uid] = true
        note_item.save
      end
    end

    render json: {
      notes_added: notes_added,
      items_added: items_added,
    }
  end

  # Performs app assigning to the challenge
  # @param id [Integer] Challenge id
  # @param app_id [Integer] App id
  # @param @context [Context] - user logged in
  # @return json { path: path(), message: { type: type, text: text } }
  def assign_app
    return unless @context.logged_in?

    challenge = Challenge.find_by!(id: unsafe_params[:id])
    app = App.editable_by(@context).find_by(id: unsafe_params[:app_id])

    unless challenge.can_assign_specific_app?(@context, app)
      path = app_path(app)
      type = :error
      text = "This app cannot be assigned to the current challenge."

      render json: { path: path, message: { type: type, text: text } }
    end

    if app
      path = jobs_api_app_path(app)
      if Challenge.add_app_dev(@context, challenge.id, app.id)
        type = :success
        text = "Your app '#{app.title}' was successfully assigned to: #{challenge.name}"
      else
        type = :error
        text = "The specified app could not be assigned to the current \
          challenge: #{challenge.name} due to an internal error."
      end
    else
      path = app_path(app)
      type = :error
      text = "The specified app was not found and could not be assigned \
        to the current challenge: #{challenge.name}."
    end

    render json: { path: path, message: { type: type, text: text } }
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
    id = unsafe_params[:id].to_i
    fail "id needs to be an Integer" unless id.is_a?(Integer)

    title = unsafe_params[:title]
    fail "title needs to be a String" unless title.is_a?(String)

    content = unsafe_params[:content] || ""
    fail "content needs to be a String" unless content.is_a?(String)

    submission = nil
    Submission.transaction do
      submission = Submission.editable_by(@context).find(unsafe_params[:id])
      fail "no submission found" unless submission
      submission.update!(desc: content)
      submission.job.update!(name: title)
    end

    render json: {
      id: submission.id,
    }
  end

  # Inputs
  # uids: array of file uids for which we want to get licenses
  #
  # Outputs
  # list of license objects
  def list_licenses_for_files
    result = https_apps_client.list_licenses_for_files unsafe_params[:uids]
    render json: result
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
    id = unsafe_params[:id].to_i
    fail "id needs to be an Integer" unless id.is_a?(Integer)

    title = unsafe_params[:title]
    fail "title needs to be a String" unless title.is_a?(String)

    content = unsafe_params[:content] || ""
    fail "content needs to be a String" unless content.is_a?(String)

    attachments_to_save = unsafe_params[:attachments_to_save] || []
    fail "attachments_to_save needs to be an array" unless attachments_to_save.is_a?(Array)

    attachments_to_delete = unsafe_params[:attachments_to_delete] || []
    fail "attachments_to_delete neeeds to be an array" unless attachments_to_delete.is_a?(Array)

    note = nil
    Note.transaction do
      note = Note.find_by!(id: unsafe_params[:id])
      fail '' unless note.editable_by?(@context)

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
      path: note_path(note),
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
    uid = unsafe_params[:uid]
    fail "Item uid needs to be a non-empty string" unless uid.is_a?(String) && uid != ""

    vote_scope = unsafe_params[:vote_scope]

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
        upvote_count: upvote_count,
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
    uid = unsafe_params[:uid]
    fail "Item uid needs to be a non-empty string" unless uid.is_a?(String) && uid != ""

    vote_scope = unsafe_params[:vote_scope]

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
        upvote_count: upvote_count,
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
    followable_uid = unsafe_params["followable_uid"]
    fail "Followable uid needs to be a non-empty string" unless followable_uid.is_a?(String) && followable_uid != ""

    followable = item_from_uid(followable_uid)
    follower = @context.user
    if followable.accessible_by?(@context) && %w(discussion challenge).include?(followable.klass)
      follower.follow(followable)
      render json: {
        followable_uid: followable_uid,
        follower_uid: follower.uid,
        follow_count: followable.followers_by_type_count(follower.class.name),
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
    followable_uid = unsafe_params["followable_uid"]
    fail "Followable uid needs to be a non-empty string" unless followable_uid.is_a?(String) && followable_uid != ""

    followable = item_from_uid(followable_uid)
    follower = @context.user
    if followable.accessible_by?(@context) && ["discussion"].include?(followable.klass)
      follower.stop_following(followable)
      render json: {
        followable_uid: followable_uid,
        follower_uid: follower.uid,
        follow_count: followable.followers_by_type_count(follower.class.name),
      }
    else
      fail "You do not have permission to unfollow this object"
    end
  end

  def update_time_zone
    current_user.update_time_zone(unsafe_params[:time_zone])
    render json: { success: true }
  end

  # Mark Item(s) as 'featured' or 'un-featured'.
  # @param item_ids [Array] array of [String] uid-s.
  # @param featured [Boolean] new 'feature' value, false if empty.
  # @return items [Array] list of items with inverted 'feature' flag
  def invert_feature
    raise ApiError, "Only Site Admin can perform this action" unless @context.can_administer_site?

    items = update_feature_flag

    messages =
      if items.count.positive?
        message_key =
          if items.first.featured?
            "api.feature.messages.featured"
          else
            "api.feature.messages.un_featured"
          end
        [{ type: "success", message: I18n.t(message_key) }]
      else
        [{ type: "error", message: I18n.t("api.feature.messages.failed") }]
      end

    render json: items, root: "items", adapter: :json, meta: messages
  end

  # Iterate over params[:item_ids], try to find items by uid and feature/un-feature PUBLIC
  # @param item_ids [Array] array of [String] uid-s.
  # @param featured [Boolean] new 'feature' value, false if empty.
  # @return items [Array] list of items with inverted 'feature' flag
  def update_feature_flag
    featured = !params[:featured].nil?
    Array(params[:item_ids]).map do |uid|
      item = item_from_uid(uid)
      next unless item.scope == Scopes::SCOPE_PUBLIC && item.featured ^ featured

      item.update(featured: featured)
      item.current_user = @context.user
      item
    end.compact
  end

  # Soft-deletion for Items.
  # @param item_ids [Array] array of [String] uid-s.
  # @return items [Array] list of deleted items (active: false)
  def soft_delete
    items = Array(params[:item_ids]).map do |uid|
      item = item_from_uid(uid)
      if item.editable_by?(@context)
        item.update(deleted: true)
        item
      end
    end.compact

    messages =
      if items.count.positive?
        [{ type: "success", message: I18n.t("api.delete.messages.deleted") }]
      else
        [{ type: "error", message: I18n.t("api.delete.messages.not_deleted") }]
      end

    render json: items, root: "items", adapter: :json, meta: { messages: messages }
  end

  def cli_latest_version
    res = https_apps_client.cli_latest_version
    render json: res, adapter: :json
  end

  def track_provenance
    res = https_apps_client.track_provenance(params[:identifier])
    render json: res, adapter: :json
  end

  protected

  # Verifies that if nodes collection contains items that belong to Protected
  # space current user has lead role in that space. Otherwise raises error for specified action.
  # @param nodes [Array] array of nodes
  # @param action action that the user is trying to perform (used for error message - delete, update)
  def verify_nodes_for_protection(nodes, action)
    nodes.each do |node|
      next if verify_scope_for_protection(node.scope)

      raise ApiError, "Only leads can #{action} files in Protected spaces."
    end
  end

  # Verifies if given scope is Protected space and if it is the user
  # must have lead role in that space
  # @param scope scope id
  # @return true if processing can continue, false if error has to be raised
  def verify_scope_for_protection(scope)
    return true unless scope.start_with?("space-")

    space = Space.from_scope(scope)

    return true unless space.protected

    !space.leads.where(user_id: @context.user.id).empty?
  end

  # Verifies if any nodes in the collection are locked and ensures that the current user
  # has a lead role in the associated space. If a node is locked and the user is not a lead,
  # it raises an error specifying the action attempted (e.g., delete, update).
  #
  # @param nodes [Array] array of nodes to be checked
  # @param action [String] the action the user is attempting to perform, used in the error message
  def verify_nodes_for_locked(nodes, action)
    nodes.each do |node|
      next unless node.scope.start_with?("space-") && node.locked
      space = Space.from_scope(node.scope)
      user_is_lead = space.leads.exists?(user_id: @context.user.id)
      # Raise error if the node is locked and the current user is not a lead in the space
      raise ApiError, "Only leads can #{action} locked files." unless user_is_lead
    end
  end

  def check_scope!
    scopes = params[:scopes]

    return if scopes.blank?

    condition = scopes.is_a?(Array) &&
      scopes.all? do |scope|
        ["public", "private", nil].include?(scope) || Space.valid_scope?(scope)
      end

    fail(t('api.errors.invalid_scope')) unless condition
  end

  def validate_get_upload_url
    size = unsafe_params[:size]
    fail "Parameter 'size' needs to be a Integer" unless size.is_a?(Integer)

    md5 = unsafe_params[:md5]
    fail "Parameter 'md5' needs to be a String" unless md5.is_a?(String)

    index = unsafe_params[:index]
    fail "Parameter 'index' needs to be a Integer" unless index.is_a?(Integer)

    id = unsafe_params[:id]
    if !id.is_a?(String) || id.empty?
      fail "Parameter 'id' needs to be a non-empty String"
    end
  end

  def validate_create_asset
    name = unsafe_params[:name]

    if !name.is_a?(String) || name.empty?
      fail "Asset name needs to be a non-empty String"
    end

    if !name.match(/\A.*\.tar(\.gz)?\z/)
      fail "Asset name should end with .tar or .tar.gz"
    end

    description = unsafe_params["description"]

    unless description.is_a?(String)
      fail "Asset description needs to be a String"
    end

    paths = unsafe_params["paths"]

    if !paths.is_a?(Array) || paths.empty? || paths.size >= 100_000
      fail "Asset paths needs to be a non-empty Array less than 100000 size"
    end

    if paths.any? { |path| !path.is_a?(String) || path.empty? || path.size >= 4096 }
      fail "Asset path should be a non-empty String of size less than 4096"
    end
  end

  # Validates and initializes parameters for a file creation.
  # rubocop:todo Metrics/MethodLength
  def validate_create_file
    folder_id = params[:folder_id].presence
    @folder =
      begin
        folder_id && Folder.find(folder_id)
      rescue ActiveRecord::RecordNotFound
        raise_api_error "The folder doesn't exist."
      end

    if @folder && !@folder.editable_by?(@context)
      raise_api_error "You don't have permissions to add files to the folder."
    end

    if @folder && @folder.state == "removing"
      raise_api_error "The target folder is being removed."
    end

    # user specified only folder id, but the folder is in space - set it for him
    if @folder && (@folder.scope.match(/^space-(\d+)$/)) && !params[:space_id]
      params[:scope] = @folder.scope
    end

    file_name = params[:name].presence
    if file_name.blank? || !file_name.is_a?(String)
      raise_api_error "File name needs to be a non-empty String"
    end

    description = params[:description].presence
    if description && !description.is_a?(String)
      raise_api_error "File description needs to be a String"
    end

    @scope = if ActiveModel::Type::Boolean.new.cast(params[:public_scope])
      Scopes::SCOPE_PUBLIC
    else
      params[:scope].presence || Scopes::SCOPE_PRIVATE
    end

    unless [Scopes::SCOPE_PUBLIC, Scopes::SCOPE_PRIVATE].include?(@scope) ||
           Space.valid_scope?(@scope)
      raise_api_error "Scope is invalid"
    end

    if Space.valid_scope?(@scope) && !Space.from_scope(@scope).editable_by?(current_user)
      raise_api_error "You don't have permissions to add files to the space."
    end

    return if @folder.nil? || @folder.scope == @scope

    raise_api_error "The folder doesn't belong to a scope #{@scope}."
  end
  # rubocop:enable Metrics/MethodLength

  # rubocop:enable Style/SignalException

  private

  def map_basic_asset(object)
    {
      id: object.id,
      uid: object.uid,
      fa_class: view_context.fa_class(object),
      title: object.prefix,
    }
  end
end
