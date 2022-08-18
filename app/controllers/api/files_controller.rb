module Api
  # Files API controller.
  # rubocop:disable Metrics/ClassLength
  class FilesController < ApiController
    include SpaceConcern
    include CommonConcern
    include Paginationable
    include Sortable
    include Scopes

    before_action :init_parent_folder, only: %i(index featured everybody spaces)
    before_action :find_file, :can_edit?, only: %i(update)
    before_action :find_user_file, only: %i(show)
    before_action :can_copy_to_scope?, only: %i(copy)
    before_action :sync_files, only: %i(index)

    DOWNLOAD_ACTION = "download".freeze
    OPEN_ACTION = "open".freeze
    PUBLISH_ACTION = "publish".freeze
    DELETE_ACTION = "delete".freeze
    COPY_ACTION = "copy".freeze
    COPY_TO_PRIVATE_ACTION = "copy_to_private".freeze

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

      user_files = Node.eager_load(user: :org).where(id: (files + folders).map(&:id)).
        order(order_params).page(page_from_params).per(page_size)
      page_dict = pagination_dict(user_files)

      render json: user_files, root: "files", adapter: :json,
             meta: files_meta.
               merge(count(UserFile.private_count(@context.user))).
               merge({ pagination: page_dict })
    end

    # GET /api/files/featured
    # A fetch method for files, accessible by public and with user taggings.
    # @param created_at [String] Param for ordering.
    # @return files [UserFile] Array of UserFile objects if they exist OR files: [].
    def featured
      filter_tags = params.dig(:filters, :tags)

      files = UserFile.real_files.
        featured.accessible_by(@context).
        where(parent_folder_id: @parent_folder_id).
        includes(:user, :taggings).eager_load(user: :org).
        search_by_tags(filter_tags)
      files = FileService::FilesFilter.call(files, params[:filters])

      folders = Folder.
        featured.
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
        where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        accessible_by(@context).
        includes(:taggings).eager_load(user: :org).
        search_by_tags(filter_tags)

      files = files.where(scoped_parent_folder_id: @parent_folder_id) unless show_count
      files = FileService::FilesFilter.call(files, params[:filters])

      folders = Folder.
        where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        accessible_by(@context).
        includes(:taggings).eager_load(user: :org).
        where(scoped_parent_folder_id: @parent_folder_id).
        search_by_tags(filter_tags)
      folders = FileService::FilesFilter.call(folders, params[:filters])

      if show_count
        render plain: files.size
      else
        nodes = Node.where(id: files + folders).eager_load(user: :org).to_a

        nodes = sort_array_by_fields(nodes, "created_at")
        page_meta = pagination_meta(nodes.count)
        nodes = paginate_array(nodes)

        render json: nodes, root: "files", adapter: :json, meta: files_meta.merge(page_meta)
      end
    end

    # GET /api/files/:id
    # A fetch method for file by file :id, accessible by user.
    # @param id [Integer] Param for file fetch.
    # @return file UserFile UserFile object with arrays of assosiated objects:
    #   notes, answers, comments, discussions, comparisons.
    # rubocop:disable Metrics/MethodLength
    def show
      # Refresh state of file, if needed
      refresh_file(@file, @context)
      load_licenses(@file)

      # TODO: move common data to common_concern.rb
      comparison = if @file.parent_type == "Comparison"
        @file.parent.slice(:id, :user_id, :scope, :state)
      else
        synchronizer = DIContainer.resolve("comparisons.sync.synchronizer")
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
      description = file_params[:description] || @file.description

      raise ApiError, "Can't rename a file." unless @file.rename(file_params[:name], description)

      render json: @file, adapter: :json
    end

    # POST /api/files/copy
    # Copies selected files and/or folders to another scope (space, public, private).
    def copy
      nodes = Node.accessible_by(@context).where(id: params[:item_ids])

      NodeCopyWorker.perform_async(
        params[:scope],
        nodes.pluck(:id),
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

    # POST /api/files/download_list
    # Responds with the files list.
    # This only works for Spaces now.
    def download_list
      task = params[:task]
      files = []

      case task
      when DOWNLOAD_ACTION, OPEN_ACTION, COPY_ACTION, COPY_TO_PRIVATE_ACTION
        nodes = Node.accessible_by(@context).where(id: params[:ids])
        nodes.each { |node| files += node.is_a?(Folder) ? node.all_files : [node] }
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

    # GET /api/files/download
    # Responds with a link to download a file.
    def download
      file = UserFile.exist_refresh_state(@context, params[:uid])

      if file.state != UserFile::STATE_CLOSED
        raise ApiError, "Files can only be downloaded if they are in the 'closed' state"
      end

      if file.license.present? && !file.licensed_by?(@context)
        raise ApiError, "You must accept the license before you can download this"
      end

      file_url = file.file_url(@context, params[:inline])

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

    # POST /api/files/create_folder - create_folder_api_files_path
    # Creates a folder.
    # @param :public [Boolean] True/False
    # @param :parent_folder_id [Integer] Folder id - nil for root folder
    # @param :space_id [Integer] id of the target space, if specified the public attribute is ignored
    # @param :name [String] a new folder name
    # @return json { path: path(), message: { type: type, text: text } }
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
      else
        type = :success
        text = "Folder '#{result.value.name}' successfully created."
      end

      path = if parent_folder.present?
        pathify_folder(parent_folder)
      else
        scope == "public" ? everybody_api_files_path : api_files_path
      end
      render json: { path: path, message: { type: type, text: text } }, adapter: :json
    end

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
    # Remove file(s) & folder(s), being selected
    # @param ids [Array of Integers] - ids of Nodes to be removed.
    # @param scope [String] - 'public', 'private' or 'space-XX'.
    def remove
      service = FolderService.new(@context)
      nodes = Node.editable_by(@context).where(id: unsafe_params[:ids])
      result = service.remove(nodes)

      if result.success?
        type = :success
        text = "Node(s) successfully removed."
      else
        type = :error
        text = "Error when Node(s) removing: #{result.value[:message]}."
      end

      path = params[:scope] == Scopes::SCOPE_PUBLIC ? everybody_api_files_path : api_files_path

      render json: { path: path, message: { type: type, text: text } }, adapter: :json
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

    def respond_with_space_files
      nodes = []

      if find_user_space
        folder_id = params[:folder_id]
        nodes = @space.nodes.files_and_folders.
          where(scoped_parent_folder_id: folder_id).
          includes(:taggings).eager_load(user: :org).
          search_by_tags(params.dig(:filters, :tags)).
          order(order_params).
          page(page_from_params).per(page_size)
        nodes = FileService::FilesFilter.call(nodes, params[:filters])
      end

      page_dict = pagination_dict(nodes)

      return render(plain: page_dict[:total_count]) if show_count

      render json: nodes, root: "files", adapter: :json,
             meta: files_meta.merge(count(page_dict[:total_count])).
             merge({ pagination: page_dict })
    end

    def render_files_list(files:, folders:)
      files_size = files.size

      return render(plain: files_size) if show_count

      user_files = Node.where(id: (files + folders).map(&:id)).eager_load(user: :org).
        order(order_params).page(page_from_params).per(page_size)

      page_dict = pagination_dict(user_files)
      page_dict[:total_count] = files_size

      render json: user_files, root: "files", adapter: :json,
             meta: files_meta.
               merge(count(page_dict[:total_count])).
               merge({ pagination: page_dict })
    end

    # Default to reverse chronological order unless overriden by params
    def order_params
      if params[:order_by]
        order_from_params
      else
        { created_at: Sortable::DIRECTION_DESC }
      end
    end

    # Get a FolderService new instance for a current context
    def folder_service
      @folder_service ||= FolderService.new(@context)
    end

    # Refresh state of files, if needed
    def sync_files
      User.sync_files!(@context)
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
  end
  # rubocop:enable Metrics/ClassLength
end
