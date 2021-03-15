module Api
  # Folders API controller.
  class FoldersController < ApiController
    before_action :find_folder, only: %i(children rename_folder)

    # GET /api/folders/children
    # Responds with the children of a specified folder.
    def children
      params[:scope] ||= "private"

      children = if params[:scope] == Scopes::SCOPE_PRIVATE
        @folder&.children ||
          current_user.nodes.where(parent_folder_id: nil)
      elsif params[:scope] == Scopes::SCOPE_PUBLIC
        @folder&.children ||
          Node.where(scope: params[:scope], parent_folder_id: nil)
      end

      if [Scopes::SCOPE_PRIVATE, Scopes::SCOPE_PUBLIC].include?(params[:scope])
        children = children.where.not(sti_type: "Asset")
      end

      children = children.where(scope: params[:scope]).order(:sti_type, :name)

      render json: children, root: "nodes", adapter: :json
    end

    # POST /api/folders/publish_folders
    # Makes selected folder(s) and all them children files publishable.
    # Check, whether folder(s) to be published already exist.
    # If yes - publish is stopped with appropriate warning.
    # @param ids [Array of Integers] - array of folders ids
    # @return count [Object] - qty of folders published or
    #   warning message when no any folders were published.
    def publish_folders
      return unless @context.can_administer_site?

      folders = Folder.where(id: params[:ids])
      head(:unprocessable_entity) && return unless folders.exists?
      files = folders.flat_map(&:all_children)

      names_match = folder_service.find_match_names(folders)
      if names_match.empty?
        count = UserFile.publish(folders + files, @context, UserFile::SCOPE_PUBLIC)

        render json: { count: count }
      else
        type = :warning
        text =
          if names_match.size > 1
            "Unable to publish: folders with names '#{names_match.join('\', \'')}' already exists"
          else
            "Unable to publish: folder with name '#{names_match.first}' already exists"
          end

        render json: { messages: [{ type: type, text: text }] }
      end
    end

    # POST /api/folders/rename_folder
    # Renames a folder.
    def rename_folder
      result = folder_service.rename(@folder, params[:name])

      raise ApiError, result.value[:message] if result.failure?

      render json: result.value, adapter: :json
    end

    private

    def find_folder
      return if params[:folder_id].blank?

      @folder = Folder.find(params[:folder_id])

      head(:forbidden) unless @folder&.accessible_by?(@context)
    end

    # Get a FolderService new instance for a current context
    def folder_service
      @folder_service ||= FolderService.new(@context)
    end
  end
end
