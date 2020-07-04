module Api
  # Files API controller.
  # rubocop:disable Metrics/ClassLength
  class FilesController < ApiController
    include Scopes

    before_action :find_file, :can_edit?, only: %i(update)
    before_action :can_copy_to_scope?, only: %i(copy)

    DOWNLOAD_ACTION = "download".freeze
    PUBLISH_ACTION = "publish".freeze
    DELETE_ACTION = "delete".freeze
    COPY_ACTION = "copy".freeze

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

      copies = node_copier.copy(nodes, params[:scope])

      # TODO: change old UI to handle json-response!
      respond_to do |format|
        messages = build_copy_messages(copies)

        format.html do
          success_msg = messages.find { |msg| msg[:type] == "success" }&.fetch(:message, nil)
          warn_msg = messages.find { |msg| msg[:type] == "warning" }&.fetch(:message, nil)

          flash[:success] = success_msg if success_msg
          flash[:alert] = warn_msg if warn_msg

          redirect_to pathify(nodes.first)
        end

        format.json do
          render json: copies.all, root: "nodes", adapter: :json, meta: { messages: messages }
        end
      end
    end

    # POST /api/files/download_list
    # Responds with the files list.
    # TODO: the similar route exists in old Files Controller. Both should be merged into one.
    #   This only works for Spaces now.
    def download_list
      task = params[:task]
      files = []

      case task
      when DOWNLOAD_ACTION, COPY_ACTION
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
      else
        raise ApiError, "Parameter 'task' is not defined!"
      end

      render json: files, each_serializer: FileActionsSerializer,
        scope_name: params[:scope] || SCOPE_PRIVATE,
        action_name: task
    end

    # Responds with the link to download a file.
    # TODO: the similar route exists in old Files Controller. Both should be merged into one.
    def download
      file = UserFile.exist_refresh_state(@context, params[:uid])

      if file.state != UserFile::STATE_CLOSED
        raise ApiError, "Files can only be downloaded if they are in the 'closed' state"
      end

      if file.license.present? && !file.licensed_by?(@context)
        raise ApiError, "You must accept the license before you can download this"
      end

      file_url = file.file_url(@context, params[:inline])

      redirect_to URI.parse(file_url).to_s
    end

    private

    def node_copier
      @node_copier ||= CopyService::NodeCopier.new(api: @context.api, user: current_user)
    end

    def find_file
      @file = UserFile.real_files.find_by(uid: params[:uid])
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

    # TODO: move message building away from the controller?
    # Builds response notifications for the copy action.
    # @param copies [CopyService::Copies] Copies
    # @return [Array<Hash>] Array of notifications.
    # rubocop:disable Metrics/MethodLength
    def build_copy_messages(copies)
      copied_count = copies.select(&:copied).size
      messages = []

      if copied_count.positive?
        messages << {
          type: "success",
          message: I18n.t("api.files.copy.success", count: copied_count),
        }
      end

      not_copied_files =
        copies.select { |copy| copy.object.is_a?(UserFile) && !copy.copied }.map(&:object)
      not_copied_folders =
        copies.select { |copy| copy.object.is_a?(Folder) && !copy.copied }.map(&:object)

      if not_copied_files.present?
        messages << {
          type: "warning",
          message: I18n.t(
            "api.files.copy.files_not_copied",
            count: not_copied_files.size,
            files: not_copied_files.map(&:name).join(", "),
          ),
        }
      end

      if not_copied_folders.present?
        messages << {
          type: "warning",
          message: I18n.t(
            "api.files.copy.folders_not_copied",
            count: not_copied_folders.size,
            folders: not_copied_folders.map(&:name).join(", "),
          ),
        }
      end

      messages
    end
    # rubocop:enable Metrics/MethodLength
  end
  # rubocop:enable Metrics/ClassLength
end
