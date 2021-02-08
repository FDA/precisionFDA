module Api
  # Folders API controller.
  class FoldersController < ApiController
    before_action :find_folder, only: %i(children rename_folder)

    # GET /api/folders/children
    # Responds with the children of a specified folder.
    def children
      params[:scope] ||= "private"

      children = @folder&.children ||
                 current_user.nodes.where(parent_folder_id: nil)
      if [Scopes::SCOPE_PRIVATE, Scopes::SCOPE_PUBLIC].include?(params[:scope])
        children = children.where.not(sti_type: "Asset")
      end

      children = children.where(scope: params[:scope]).order(:sti_type, :name)

      render json: children, root: "nodes", adapter: :json
    end

    # POST /api/folders/publish_folders
    # Makes selected folder(s) and all them children files publishable.
    def publish_folders
      return unless @context.can_administer_site?

      folders = Folder.where(id: params[:ids], user_id: @context.user_id)
      head(:unprocessable_entity) && return unless folders.exists?
      files = folders.flat_map(&:all_children)

      count = UserFile.publish(folders + files, @context, UserFile::SCOPE_PUBLIC)

      render json: { count: count }
    end

    # POST /api/folders/rename_folder
    # Renames a folder.
    def rename_folder
      result = folder_service.rename(@folder, params[:name])

      raise ApiError, result.value.values if result.failure?

      render json: result.value, adapter: :json
    end

    private

    def find_folder
      return if params[:folder_id].blank?

      @folder = Folder.find(params[:folder_id])

      head(:forbidden) unless @folder&.accessible_by?(@context)
    end

    def folder_service
      @folder_service ||= FolderService.new(@context)
    end
  end
end
