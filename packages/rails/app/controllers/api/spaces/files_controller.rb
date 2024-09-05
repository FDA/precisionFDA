module Api
  module Spaces
    # Space Files API controller.
    class FilesController < ApiController
      include SpaceConcern

      before_action :find_space
      before_action :can_edit?, except: %i(subfolders)

      # POST /api/spaces/:space_id/files/publish_files
      # Makes selected files public.
      def publish_files
        files = @space.files.where(id: params[:ids])
        head(:unprocessable_entity) && return unless files.exists?

        count = UserFile.publish(files, @context, UserFile::SCOPE_PUBLIC)

        render json: { count: count }
      end

      # POST /api/spaces/:space_id/files/move_nodes
      # Moves files and/or folders from one folder to another.
      def move
        target_folder = @space.folders.find_by(id: params[:target_id]) if params[:target_id]
        nodes = @space.nodes.files_folders_assets.where(id: params[:node_ids])

        result = folder_service.move(
          nodes,
          target_folder,
          target_folder&.scope || @space.uid,
        )

        raise ApiError, result.value[:message] if result.failure?

        render json: { count: result.value[:count] }
      end

      # Responds with the subfolders of a specified folder.
      def subfolders
        sub_folders =
          if params[:folder_id].present?
            @space.folders.find(params[:folder_id]).sub_folders
          else
            @space.folders.where(scoped_parent_folder_id: nil)
          end

        render json: sub_folders, root: "nodes", adapter: :json
      end

      private

      def folder_service
        @folder_service ||= FolderService.new(@context)
      end
    end
  end
end
