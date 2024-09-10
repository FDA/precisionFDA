module Api
  # Files API controller.
  # rubocop:disable Metrics/ClassLength
  class FilesController < ApiController
    include ActionController::Live
    include SpaceConcern
    include CommonConcern
    include Paginationable
    include Sortable
    include Scopes

    before_action :init_parent_folder, only: %i(index featured everybody spaces cli)
    before_action :find_file, :can_edit?, only: %i(update)
    before_action :find_user_file, only: %i(show)
    before_action :can_copy_to_scope?, only: %i(copy)

    DOWNLOAD_ACTION = "download".freeze
    OPEN_ACTION = "open".freeze
    PUBLISH_ACTION = "publish".freeze
    DELETE_ACTION = "delete".freeze
    COPY_ACTION = "copy".freeze
    COPY_TO_PRIVATE_ACTION = "copy_to_private".freeze
    LOCK_ACTION = "lock".freeze
    UNLOCK_ACTION = "unlock".freeze

    ORDER_FIELDS = {
      "created_at" => "created_at",
      "name" => "name",
      "size" => "file_size",
      "state" => "state",
      "username" => %w(users.first_name users.last_name),
    }.freeze

    SORT_FIELDS = {
      "created_at" => ->(left, right) { left.created_at <=> right.created_at },
      "name" => ->(left, right) { left.name <=> right.name },
      "location" => ->(left, right) { left.location.downcase <=> right.location.downcase },
      "size" => ->(left, right) { left.file_size <=> right.file_size },
      "username" => ->(left, right) { left.user.full_name <=> right.user.full_name },
    }.freeze

    # GET /api/files or GET /api/files/?space_id=params[:space_id]
    # A common UserFies fetch method for space and home pages, depends upon @params[:space_id].
    # @param space_id [Integer] Space id for files fetch. When it is nil, then fetching for
    #   all files, editable by current user.
    # @param order_by, order_dir [String] Params for ordering.
    # @return files [UserFile] Array of UserFile objects if they exist OR files: [].
    def index
      # Fetches space files.
      respond_with_space_files && return if params[:space_id]

      # Fetches all user 'private' files.
      filter_tags = params.dig(:filters, :tags)

      files = UserFile.
        real_files.
        not_removing.
        editable_by(@context).
        accessible_by_private.
        where.not(parent_type: ["Comparison", nil]).
        includes(:taggings).
        eager_load(user: :org).
        search_by_tags(filter_tags)

      return render(plain: files.size) if show_count

      files = files.where(parent_folder_id: @parent_folder_id)
      files = FileService::FilesFilter.call(files, params[:filters])

      folders = private_folders(@parent_folder_id).includes(:taggings).
        eager_load(user: :org).search_by_tags(filter_tags)
      folders = FileService::FilesFilter.call(folders, params[:filters])

      user_files = Node.eager_load(user: :org).where(id: (files + folders).map(&:id))

      if params[:order_by_property]
        user_files = user_files.
          # has to join properties because of sorting by them.
          left_outer_joins(:properties).
          order(order_params).
          page(page_from_params).per(page_size)
      else
        user_files = user_files.order(order_params).page(page_from_params).per(page_size)
      end

      page_dict = pagination_dict(user_files)

      render json: user_files, root: "files", adapter: :json,
             meta: files_meta.
               merge(count(UserFile.private_count(@context.user))).
               merge({ pagination: page_dict })
    end

    # USED EXCLUSIVELY BY CLI
    def describe
      # the param is actually uid, this is because default ruby behavior. Not worth it to change.
      res = https_apps_client.describe(params[:uid])
      render json: res
    end

    # GET /api/files/cli
    # Used by CLI. Get all nodes accessible by current user, including those currently being removed.
    # Allows filtering by space_id and/or folder_id.
    # Allows filtering files/folders only.
    def cli
      # if only folder_id is provided, check if it's a space folder
      if params[:folder_id]
        folder = Folder.find(params[:folder_id])
        if (match = folder.scope.match(/^space-(\d+)$/)) && !params[:space_id]
          params[:space_id] = match[1]
        end
      end

      space_files_cli && return if params[:space_id]

      files = []
      folders = []
      unless params[:folders_only] == "true"
        # rubocop:disable Layout/LineLength
        files = params[:public_scope] ? UserFile.real_files.accessible_by_public : UserFile.real_files.accessible_by_private.where(user: @context.user)
        # rubocop:enable Layout/LineLength
        files = files.where(parent_folder_id: @parent_folder_id).
          where.not(parent_type: ["Comparison", nil]).
          eager_load(user: :org)
      end

      unless params[:files_only] == "true"
        folders = params[:public_scope] ? Folder.accessible_by_public : Folder.accessible_by_private.where(user: @context.user)
        folders = folders.where(parent_folder_id: @parent_folder_id).eager_load(user: :org)
      end

      user_files = folders + FileService::FilesFilter.call(files, params[:filters])

      render json: user_files, root: "files", adapter: :json, each_serializer: CliNodeSerializer,
             meta: cli_meta
    end

    def cli_meta
      meta = {}
      meta[:path] = "Files / "
      if params[:space_id]
        space = Space.find(params[:space_id])
        meta[:scope] = "space-#{space.id} (#{space.name})"
      else
        meta[:scope] = params[:public_scope] ? "Public" : "My Home (Private)"
      end

      if params[:folder_id]
        folder = Folder.find(params[:folder_id])
        meta[:path] = meta[:path] + build_path(folder, []).reverse.pluck(:name).join(" / ")
      end
      meta
    end

    # Listing nodes based on given criteria. Supports wildcard name search.
    # Used by CLI exclusively with a custom response mapping.
    def cli_node_search
      res = https_apps_client.cli_node_search(params[:name], params[:type], params[:space_id], params[:parent_folder_id])
      user_files = res.map do |node|

        n = {
          id: node["id"],
          uid: node["uid"],
          type: node["stiType"],
          name: node["name"],
          file_size: node["fileSize"],
          created_at: node["createdAt"].to_datetime.strftime("%Y-%m-%d %H:%M:%S"),
        }
        n.merge!({ children: node["children"].length }) if node["stiType"] == "Folder"
        n
      end
      if user_files.blank?
        # no match | no permission | invalid id
        render(plain: "[]", content_type: "application/json")
      else
        render json: user_files, root: true, adapter: :json
      end
      # usually permission issues
    rescue HttpsAppsClient::Error => e
      fail e.message
    end

    def path_resolver
      result = https_apps_client.resolve_path(params[:path], params[:scope], params[:type])
      render json: result
    end

    # GET /api/files/featured
    # A fetch method for files, accessible by public and with user taggings.
    # @param created_at [String] Param for ordering.
    # @return files [UserFile] Array of UserFile objects if they exist OR files: [].
    def featured
      filter_tags = params.dig(:filters, :tags)

      files = UserFile.real_files.
        not_removing.
        featured.accessible_by(@context).
        where(parent_folder_id: @parent_folder_id).
        includes(:user, :taggings).eager_load(user: :org).
        search_by_tags(filter_tags)
      files = FileService::FilesFilter.call(files, params[:filters])

      folders = Folder.
        featured.
        not_removing.
        accessible_by(@context).
        where(parent_folder_id: @parent_folder_id).
        includes(:taggings).
        eager_load(user: :org).
        search_by_tags(filter_tags)
      folders = FileService::FilesFilter.call(folders, params[:filters])

      render_files_list(files: files, folders: folders)
    end

    # GET /api/files/everybody
    # A fetch method for files, accessible by public and of latest revisions.
    # @param created_at [String] Param for ordering.
    # @return files [UserFile] Array of UserFile objects if they exist OR files: [].
    def everybody
      filter_tags = params.dig(:filters, :tags)

      files =
        UserFile.real_files.
          not_removing.
          accessible_by_public.
          includes(:taggings).eager_load(user: :org).
          search_by_tags(filter_tags)

      files = files.where(parent_folder_id: @parent_folder_id) unless show_count
      files = FileService::FilesFilter.call(files, params[:filters])

      folders = explore_folders(@parent_folder_id).includes(:taggings).
        eager_load(user: :org).search_by_tags(filter_tags)
      folders = FileService::FilesFilter.call(folders, params[:filters])

      render_files_list(files: files, folders: folders)
    end

    # GET /api/files/spaces
    # A fetch method for files, accessible by user and of 'space' scope.
    # @param created_at [String] Param for ordering.
    # @return files [UserFile] Array of UserFile and Folder objects,
    #   which scope is not 'private' or 'public', i.e.
    #   files and folders scope is one of 'space-...', if they exist OR files: [].
    def spaces
      filter_tags = params.dig(:filters, :tags)

      files = UserFile.real_files.
        not_removing.
        where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        accessible_by(@context).
        includes(:taggings).eager_load(user: :org).
        search_by_tags(filter_tags)

      files = files.where(scoped_parent_folder_id: @parent_folder_id) unless show_count
      files = FileService::FilesFilter.call(files, params[:filters])

      folders = Folder.
        where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        not_removing.
        accessible_by(@context).
        includes(:taggings).eager_load(user: :org).
        where(scoped_parent_folder_id: @parent_folder_id).
        search_by_tags(filter_tags)
      folders = FileService::FilesFilter.call(folders, params[:filters])

      if show_count
        render plain: files.size
      else
        # TODO: try if this method can be used instead of commented-out code below.
        render_files_list(files: files, folders: folders)

        # nodes = Node.where(id: files + folders).eager_load(user: :org).to_a
        #
        # nodes = sort_array_by_fields(nodes, "created_at")
        # page_meta = pagination_meta(nodes.count)
        # nodes = paginate_array(nodes)
        #
        # render json: nodes, root: "files", adapter: :json, meta: files_meta.merge(page_meta)
      end
    end

    # GET /api/files/:id
    # A fetch method for file by file :id, accessible by user.
    # @param id [Integer] Param for file fetch.
    # @return file UserFile UserFile object with arrays of assosiated objects:
    #   notes, answers, comments, discussions, comparisons.
    # rubocop:disable Metrics/MethodLength
    def show
      load_licenses(@file)

      # TODO: move common data to common_concern.rb
      comparison = if @file.parent_type == "Comparison"
                     @file.parent.slice(:id, :user_id, :scope, :state)
                   else
                     synchronizer.sync_comparisons!(@context.user)
                     @file.comparisons.accessible_by(@context).includes(:taggings)
                   end

      comments = if @file.in_space?
                   Comment.where(commentable: @file.space_object, content_object: @file).
                     order(id: :desc).page(params[:comments_page])
                 else
                   @file.root_comments.order(id: :desc).page(params[:comments_page])
                 end

      notes_ids = Attachment.file_attachments(@file.id).pluck(:note_id)
      notes = Note.where(id: notes_ids).real_notes.
        accessible_by(@context).select(:id, :user_id).order(id: :desc).page(params[:notes_page])

      answers = @file.notes.
        accessible_by(@context).
        answers.order(id: :desc).page(params[:answers_page])

      discussions = @file.notes.
        accessible_by(@context).
        discussions.order(id: :desc).page(params[:discussions_page])

      render json: @file, root: "files", adapter: :json,
             meta: {
               user_licenses: @licenses,
               object_license: @license,
               comments: comments,
               discussions: discussions,
               answers: answers,
               notes: notes,
               comparisons: comparison,
               links: meta_links(@file),
             }
    end

    # rubocop:enable Metrics/MethodLength

    # Updates file name and description.
    # PUT /api/files/:uid
    def update
      raise ApiError, "File needs to be unlocked" if @file.locked?

      verify_nodes_for_protection([@file], "update")

      description = file_params[:description] || @file.description
      raise ApiError, "Can't rename a file." unless @file.rename(file_params[:name], description)

      render json: @file, adapter: :json
    end

    # POST /api/files/copy
    # Copies selected files and/or folders to another scope (space, public, private).
    def copy
      nodes = Node.accessible_by(@context).where(id: params[:item_ids])

      verify_nodes_for_protection(nodes, "copy")
      verify_nodes_for_locked(nodes, "copy")
      verify_target_scope_for_protection(nodes, params[:scope])

      NodeCopyWorker.perform_async(
        params[:scope],
        nodes.pluck(:id),
        params[:folder_id] || nil,
        session_auth_params,
      )

      render json: nodes, root: "nodes", adapter: :json,
             meta: {
               messages: [{
                 type: "success",
                 message: I18n.t("api.files.copy.files_are_copying"),
               }],
             }
    end

    # used in POST /api/files/download_list
    # Filtering nodes for locking and unlocking.
    def process_nodes(task)
      nodes = Node.editable_by(@context).where(id: params[:ids])
      files = nodes.flat_map { |node| node.is_a?(Folder) ? node.all_files : node }
      files.select! { |file| file.scope == params[:scope] }

      case task
      when LOCK_ACTION
        files.reject!(&:locked?)
      when UNLOCK_ACTION
        files.select!(&:locked?)
      else
        raise ApiError, "Parameter 'task' is not defined!"
      end

      files
    end

    # POST /api/files/download_list
    # Responds with the files list.
    # This only works for Spaces now.
    # rubocop:disable Metrics/MethodLength
    def download_list
      task = params[:task]
      files = []

      case task
      when DOWNLOAD_ACTION, OPEN_ACTION, COPY_ACTION, COPY_TO_PRIVATE_ACTION
        nodes = Node.accessible_by(@context).where(id: params[:ids])
        nodes.each { |node| files += node.is_a?(Folder) ? node.all_files : [node] }
      when LOCK_ACTION, UNLOCK_ACTION
        files = process_nodes(task)
      when PUBLISH_ACTION
        nodes = Node.editable_by(@context).
          where(id: params[:ids]).
          where.not(scope: UserFile::SCOPE_PUBLIC)
        nodes.each do |node|
          files += if node.is_a?(Folder)
                     node.all_files(Node.where.not(scope: UserFile::SCOPE_PUBLIC))
                   else
                     [node]
                   end
        end
      when DELETE_ACTION
        nodes = Node.editable_by(@context).where(id: params[:ids]).to_a
        files += nodes
        nodes.each { |node| files += node.all_children if node.is_a?(Folder) }
        files.filter! { |file| file.scope == params[:scope] }
      else
        raise ApiError, "Parameter 'task' is not defined!"
      end

      render json: files,
             each_serializer: FileActionsSerializer,
             scope_name: params[:scope] || SCOPE_PRIVATE,
             action_name: task
    end

    # rubocop:enable Metrics/MethodLength
    # GET /api/files/download
    # Responds with a link to download a file.
    def download
      if called_by_cli
        cli_download
        return
      end

      file = UserFile.accessible_found_by(@context, params[:uid])
      verify_nodes_for_protection([file], "download")

      if file.state != UserFile::STATE_CLOSED
        raise ApiError, "Files can only be downloaded if they are in the 'closed' state"
      end

      if file.license.present? && !file.licensed_by?(@context)
        raise ApiError, "You must accept the license before you can download this"
      end

      file_url = https_apps_client.get_file_download_link(params[:uid])

      respond_to do |format|
        format.html do
          redirect_to URI.parse(file_url).to_s
        end

        format.json do
          render json: {
            file_url: file_url,
            file_size: file.file_size,
          }, adapter: :json
        end
      end
    end

    def cli_download
      options = {
        duration: unsafe_params.fetch(:duration, 86_400),
        preauthenticated: unsafe_params.fetch(:preauthenticated, false),
        inline: unsafe_params.fetch(:inline, false),
      }

      match = request.headers["User-Agent"].match(/precisionFDA CLI\/([\d\.]+)/)
      version = match[1]
      # parse the version and if it's 2.6.0 or older, provide direct link
      if Gem::Version.new(version) <= Gem::Version.new("2.6.0")
        # if cli is 2.6.0 or older, provide direct link. Otherwise, provide proxy link.
        options[:preauthenticated] = true
      end

      file = UserFile.accessible_found_by(@context, params[:uid])
      url = https_apps_client.get_file_download_link(params[:uid], options)

      render json: {
        file_url: url,
        file_size: file.file_size,
      }, adapter: :json
    end

    # GET /api/files/:uid/:filename
    def download_file
      file = UserFile.accessible_by(@context).find_by_uid!(params[:uid])
      file_link = file.file_link(@context, params[:inline], true, false)

      uri = URI(file_link[:url])
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true

      range = request.headers["Range"]
      req = Net::HTTP::Get.new(uri)
      # !!! DON'T FORGET TO HANDLE RANGE REQUESTS IN NODE WHEN MIGRATING !!!
      req["Range"] = range if range.present?
      file_link[:headers].each { |k, v| req[k] = v }

      response.headers["Accept-Ranges"] = "bytes"

      begin
        http.request(req) do |resp|
          # !!! DON'T FORGET TO HANDLE RANGE REQUESTS IN NODE WHEN MIGRATING !!!
          send_data_response(resp, range)
        end
      ensure
        response.stream.close if response.stream.respond_to?(:close)
      end
    end

    def send_data_response(resp, range)
      if range.present? && resp.code == "206" # Partial content
        response.status = 206
        response.headers["Content-Range"] = resp["Content-Range"]
        response.headers["Content-Length"] = resp["Content-Length"]
      end

      response.headers["Content-Type"] = resp["Content-Type"]
      response.headers["Content-Disposition"] = resp["Content-Disposition"]
      response.headers['Cache-Control'] = 'public, max-age=86400' # 24 hours in seconds
      response.headers['Expires'] = 24.hours.from_now.httpdate
      response.headers["ETag"] = "0"

      resp.read_body do |chunk|
        response.stream.write chunk
      end
    end

    # POST /api/files/bulk_download
    # Responds with an array of links to platform for download requested files - filters out only accessible files.
    # Used by CLI to reduce number of back-and-forth calls needed to download larger number of files
    def bulk_download
      options = {
        duration: unsafe_params.fetch(:duration, 86_400),
        preauthenticated: unsafe_params.fetch(:preauthenticated, false),
        inline: unsafe_params.fetch(:inline, false),
      }

      match = request.headers["User-Agent"].match(/precisionFDA CLI\/([\d\.]+)/)
      version = match[1]
      if Gem::Version.new(version) <= Gem::Version.new("2.6.0")
        # if cli is 2.6.0 or older, provide direct link. Otherwise, provide proxy link.
        options[:preauthenticated] = true
      end

      nodes = UserFile.accessible_by(@context).where(uid: params[:ids])

      nodes = nodes.reject do |node|
        # Reject nodes that are not in the closed state
        node.state != UserFile::STATE_CLOSED ||
          # Reject nodes that have a license but are not licensed by the current user context
          (node.license.present? && !file.licensed_by?(@context)) ||
          # Reject nodes from protected spaces if not admin
          !verify_scope_for_protection(node.scope)
      end

      files = nodes.map do |item|
        {
          uid: item[:uid],
          url: https_apps_client.get_file_download_link(item[:uid], options)
        }
      end.compact

      render json: files
    end

    # POST /api/files/create_folder - create_folder_api_files_path
    # Creates a folder.
    # @param :public [Boolean] True/False
    # @param :parent_folder_id [Integer] Folder id - nil for root folder
    # @param :space_id [Integer] id of the target space, if specified the public attribute is ignored
    # @param :name [String] a new folder name
    # @return json { path: path(), message: { type: type, text: text } }
    # rubocop:disable Metrics/MethodLength
    def create_folder
      if params[:space_id] && find_user_space
        scope = @space.uid
        parent_folder = Folder.editable_by(@context).find_by(id: params[:parent_folder_id])
      elsif params[:public] == "true"
        if @context.user.can_administer_site?
          parent_folder = Folder.accessible_by_public.find_by(id: params[:parent_folder_id])
          scope = "public"
        else
          path = everybody_api_files_path
          type = :error
          text = "You are not allowed to create public folders"
          render json: { path: path, message: { type: type, text: text } }, adapter: :json
          return
        end
      else
        parent_folder = Folder.editable_by(@context).find_by(id: params[:parent_folder_id])
        scope = "private"
      end

      result = folder_service.add_folder(params[:name], parent_folder, scope)

      if result.failure?
        type = :error
        text = result.value[:name]
        id = find_existing_folder_id(scope)
      else
        type = :success
        text = "Folder '#{result.value.name}' successfully created."
        id = result.value.id
      end

      path = if parent_folder.present?
        pathify_folder(parent_folder)
      else
        scope == "public" ? everybody_api_files_path : api_files_path
      end
      render json: { path: path, id: id, message: { type: type, text: text } }, adapter: :json
    end

    # rubocop:enable Metrics/MethodLength
    # POST /api/files/move - move_api_files path
    # @param target_id [Integer] target folder id
    # @param node_ids [Array of Integers] ids of nodes to be moved
    # @param scope [String] optional, scope of nodes moving
    # @return { path: path, message: { type: type, text: text } } - standard path object
    def move
      target_folder_id = params[:target_id] == "root" ? nil : params[:target_id]
      target_folder =
        target_folder_id ? Folder.accessible_by_user(@context.user).find(target_folder_id) : nil
      service = FolderService.new(@context)

      result = service.move(
        Node.where(id: params[:node_ids]),
        target_folder,
        params[:scope],
      )

      if result.success?
        target_folder_name = target_folder.present? ? target_folder.name : "root directory"
        type = :success
        text = "Successfully moved #{result.value[:count]} item(s) to #{target_folder_name}"
      else
        type = :error
        text = result.value.values
      end

      path = if target_folder.present?
               pathify_folder(target_folder)
             else
               result.value[:scope] == "public" ? everybody_api_files_path : api_files_path
             end

      render json: { path: path, message: { type: type, text: text } }, adapter: :json
    end

    # POST /api/files/remove
    # Remove file(s) & folder(s) including nested files and folders.
    # @param ids [Array of Integers] - ids of Nodes to be removed.
    def remove
      response = https_apps_client.remove_nodes(unsafe_params[:ids])
      render json: response
    end

    # GET /api/files/bulk_download
    # Returns a zip stream containing all files specified by the IDs.
    # If the ID of a folder is provided, all its contents, including
    # nested folders, are included.
    def bulk_download_content
      id = params[:id] # actual array
      scope = Node.find(id[0]).scope # just temporary solution until we switch to Node

      timestamp = Time.zone.now.strftime("%Y%m%d%H%M%S")
      response.headers["Content-Type"] = "application/octet-stream"
      response.headers["Content-Disposition"] = "attachment; filename=\"pfda_archive_#{scope}_#{timestamp}.zip\""
      response.headers["ETag"] = "0"

      https_apps_client.bulk_download(id) do |chunk|
        response.stream.write(chunk)
      end
    ensure
      response.stream.close
    end

    def cli_remove
      if unsafe_params[:uids]
        node_ids = Node.editable_by(@context).where(uid: unsafe_params[:uids]).pluck(:id)
        response = https_apps_client.cli_remove_nodes(node_ids)
      else
        response = https_apps_client.cli_remove_nodes(unsafe_params[:ids])
      end
      render json: { count: response }
    rescue HttpsAppsClient::Error => e
      raise ApiError, e.message
    end

    # GET /api/files/selected
    # Returns a list of files and files in folders by selected node ids.
    # @param ids [Array of Strings] - selected node ids
    def list_selected_files
      response = https_apps_client.list_selected_files(unsafe_params[:ids])
      render json: response
    end

    # POST /api/files/copy/validate
    # Validate copying of selected files to target scope.
    # A file can only exist once in scope, so we need to check if the file is already there.
    # @param uids [Array of Strings] - uids of files to be copied
    # @param scope [String] - target scope
    def validate_copy
      response = https_apps_client.validate_copy(unsafe_params[:uids], unsafe_params[:scope])
      render json: response
    end

    # Overridden version: it accepts not only file-uids, but also folder id.
    # Result of this operation not only invert flag of folder(s),
    # but also all PUBLIC children items.
    # @param item_ids [Array] array of [String] uid-s.
    # @param featured [Boolean] new 'feature' value, false if empty.
    # @return items [Array] list of folder/files with inverted 'feature' flag
    def update_feature_flag
      raise ApiExceptionHandler, Message.not_allowed unless @context.user.site_admin?

      FileService::ToggleFeaturePublicFolderService.new(params, @context).call
    end

    private

    def called_by_cli
      user_agent = request.headers['User-Agent']
      user_agent&.include?('precisionFDA CLI')
    end

    # Verifies if at least one node is in Protected space
    # the target scope must be Protected space as wel and current
    # user must have a leader role in it
    # @param nodes list of nodes being copied
    # @param scope scope id
    # @return true if processing can continue, false if error has to be raised
    def verify_target_scope_for_protection(nodes, scope)
      return unless Space.valid_scope?(scope)

      protected_nodes = nodes.select do |node|
        if Space.valid_scope?(node.scope)
          space = Space.from_scope(node.scope)
          space.protected
        end
      end

      return if protected_nodes.empty?

      space = Space.from_scope(scope)
      return if space.protected && !space.leads.where(user_id: @context.user.id).empty?

      raise ApiError, "You can only copy to another Protected Space when you have the Lead role in both Spaces."
    end

    def respond_with_space_files
      nodes = []

      if find_user_space
        folder_id = params[:folder_id]
        nodes = @space.nodes.files_folders_assets.
          where(scoped_parent_folder_id: folder_id).
          where(state: [nil, "closing", "closed", "open"]).
          includes(:taggings).eager_load(user: :org).
          search_by_tags(params.dig(:filters, :tags))

        if params[:order_by_property]
          nodes = nodes.
            left_outer_joins(:properties).
            order(order_params).
            page(page_from_params).per(page_size)
        else
          nodes = nodes.order(order_params).
              page(page_from_params).per(page_size)
        end

        nodes = FileService::FilesFilter.call(nodes, params[:filters])
      end

      page_dict = pagination_dict(nodes)

      return render(plain: page_dict[:total_count]) if show_count

      render json: nodes, root: "files", adapter: :json,
             meta: files_meta.merge(count(page_dict[:total_count])).
               merge({ pagination: page_dict })
    end

    def space_files_cli
      raise ApiError, "Space unreachable" unless find_user_space
      files = []
      folders = []
      folder_id = params[:folder_id]

      unless params[:folders_only] == "true"
        files = FileService::FilesFilter.call(
          @space.nodes.files.where(scoped_parent_folder_id: folder_id).
            eager_load(user: :org), params[:filters]
        )
      end
      unless params[:files_only] == "true"
        folders = @space.nodes.folders.
          where(scoped_parent_folder_id: folder_id).eager_load(user: :org)
      end
      space_files = folders + files

      render json: space_files, root: "files", adapter: :json, each_serializer: CliNodeSerializer,
             meta: cli_meta
    end

    def render_files_list(files:, folders:)
      files_size = files.size

      return render(plain: files_size) if show_count

      user_files = Node.where(id: (files + folders).map(&:id)).eager_load(user: :org)

      if params[:order_by_property]
        user_files = user_files.left_outer_joins(:properties).
          order(order_params).page(page_from_params).per(page_size)
      else
        user_files = user_files.order(order_params).page(page_from_params).per(page_size)
      end
      page_dict = pagination_dict(user_files)
      page_dict[:total_count] = files_size

      render json: user_files, root: "files", adapter: :json,
             meta: files_meta.
               merge(count(page_dict[:total_count])).
               merge({ pagination: page_dict })
    end

    # Default to reverse chronological order unless overriden by params
    def order_params
      if params[:order_by_property]
        create_property_order
      elsif params[:order_by]
        order_from_params
      else
        { created_at: Sortable::DIRECTION_DESC }
      end
    end

    # Get a FolderService new instance for a current context
    def folder_service
      @folder_service ||= FolderService.new(@context)
    end

    def init_parent_folder
      @parent_folder_id = unsafe_params[:folder_id]
    end

    def private_folders(parent_folder_id = nil)
      Folder.
        private_for(@context).
        editable_by(@context).
        where(parent_folder_id: parent_folder_id)
    end

    def explore_folders(parent_folder_id = nil)
      Folder.
        accessible_by_public.
        where(parent_folder_id: parent_folder_id)
    end

    def files_meta
      meta = {}

      meta[:links] = {}.tap do |links|
        links[:copy_private] = copy_api_files_path

        if @space&.editable_by?(current_user)
          links[:publish] = publish_files_api_space_files_path(@space)
          links[:move] = move_api_space_files_path(@space)
          links[:remove] = remove_api_space_files_path(@space)
          links[:copy] = copy_api_files_path
          links[:create_folder] = create_folder_api_space_files_path(@space)
        end
      end

      if params[:folder_id]
        folder = Folder.find(params[:folder_id])
        meta[:path] = build_path(folder, []).reverse
      end

      meta
    end

    def build_path(folder, built)
      built << { id: folder.id, name: folder.name }
      parent = folder.parent_folder
      build_path(parent, built) if parent
      built
    end

    def node_copier
      @node_copier ||= CopyService::NodeCopier.new(api: @context.api, user: current_user)
    end

    def find_file
      @file = UserFile.real_files.find_by(uid: params[:uid])
    end

    def find_user_file
      @file = UserFile.where.not(parent_type: "Asset").accessible_by(@context).
        includes(:user).find_by!(uid: params[:uid])
    rescue ActiveRecord::RecordNotFound => e
      raise ApiError, Message.not_found(e.exception.model)
    end

    def can_edit?
      head(:forbidden) unless @file.editable_by?(@context)
    end

    def file_params
      params.require(:file).permit(:name, :description)
    end

    def can_copy_to_scope?
      scope = params[:scope]

      return if [Scopes::SCOPE_PUBLIC, Scopes::SCOPE_PRIVATE].include?(params[:scope])

      space = Space.from_scope(scope) if Space.valid_scope?(scope)

      raise ApiError, "Scope parameter is incorrect (can be public or space-x)" unless space

      return if space.editable_by?(current_user)

      raise ApiError, "You have no permissions to copy files to the scope '#{scope}'"
    end

    def find_existing_folder_id(scope)
      if scope == "private"
        Folder.editable_by(@context).
          where(parent_folder_id: params[:parent_folder_id]).
          where(name: params[:name]).
          where(scope: scope).
          first.id
      else
        Folder.editable_by(@context).
          where(scoped_parent_folder_id: params[:parent_folder_id]).
          where(name: params[:name]).
          where(scope: scope).
          first.id
      end
    end

    def create_property_order
      properties_table = Arel::Table.new(:properties)
      property_order = ActiveRecord::Base.sanitize_sql(params[:order_by_property])
      order_dir = params[:order_dir].upcase == "ASC" ? "ASC" : "DESC"

      order_by_case = Arel::Nodes::Case.new(properties_table[:property_name]).when(property_order).then(0).else(1)
      order_by_property_value = properties_table[:property_value].send(order_dir.downcase.to_sym)

      # It will produce something like this - easier to understand for node migration later:
      # CASE WHEN properties.property_name = #{params[:order_by_property]} THEN 0 ELSE 1 END, properties.property_value #{params[:order_dir]}
      [order_by_case, order_by_property_value]
    end
  end

  # rubocop:enable Metrics/ClassLength
end
