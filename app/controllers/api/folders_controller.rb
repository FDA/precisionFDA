module Api
  # Folders API controller.
  class FoldersController < ApiController
    before_action :find_folder, only: %i(children)

    # Responds with the children of a specified folder.
    def children
      children = @folder&.children ||
                 current_user.nodes.where(parent_folder_id: nil)
      children = children.where(scope: Scopes::SCOPE_PRIVATE).order(:sti_type, :name)

      render json: children, root: "nodes", adapter: :json
    end

    private

    def find_folder
      return if params[:folder_id].blank?

      @folder = Folder.find(params[:folder_id])

      head(:forbidden) unless @folder.accessible_by?(@context)
    end
  end
end
