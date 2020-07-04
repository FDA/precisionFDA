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
        nodes = @space.nodes.files_and_folders.where(id: params[:node_ids])

        result = folder_service.move(
          nodes,
          target_folder,
          @space.uid,
        )

        raise ApiError, result.value[:message] if result.failure?

        render json: { count: result.value[:count] }
      end

      # POST /api/spaces/:space_id/files/remove_nodes
      # Removes folders or/and files from a space.
      # Fires a background Sidekiq worker RemoveFolderWorker when all permissions are passed.
      def remove
        filtered_ids = (
          @space.files.not_comparison_inputs.pluck(:id) +
          @space.assets.not_comparison_inputs.pluck(:id) +
          @space.folders.pluck(:id)
        ) & params[:node_ids]

        nodes = @space.nodes.where(id: filtered_ids)

        Node.transaction do
          nodes.find_each { |node| node.update!(state: UserFile::STATE_REMOVING) }

          nodes.where(sti_type: "Folder").find_each do |folder|
            folder.all_children.each { |node| node.update!(state: UserFile::STATE_REMOVING) }
          end

          Array(nodes.pluck(:id)).in_groups_of(1000, false) do |ids|
            job_args = ids.map do |node_id|
              [node_id, session_auth_params]
            end

            Sidekiq::Client.push_bulk("class" => RemoveNodeWorker, "args" => job_args)
          end
        end

        head :ok
      end

      # POST /api/spaces/:space_id/files/create_folder
      # Creates a folder.
      def create_folder
        parent_folder = @space.folders.find_by(id: params[:parent_folder_id])

        result = folder_service.add_folder(params[:name], parent_folder, @space.uid)

        raise ApiError, "Can't create a folder with name '#{params[:name]}'." if result.failure?

        render json: result.value, adapter: :json
      end

      # POST /api/spaces/:space_id/files/:id/rename_folder
      # Renames a folder.
      def rename_folder
        folder = @space.folders.find(params[:id])

        result = folder_service.rename(folder, params[:name])

        raise ApiError, result.value.values if result.failure?

        render json: result.value, adapter: :json
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
