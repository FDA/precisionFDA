module Api
  # Node requests controller.
  class NodesController < ApiController

    # POST /api/nodes/lock
    def lock
      path = params[:scope] == Scopes::SCOPE_PUBLIC ? everybody_api_files_path : api_files_path
      https_apps_client.nodes_lock(unsafe_params[:ids])
      render json: { path: path }, adapter: :json
    end

    # POST /api/nodes/unlock
    def unlock
      path = params[:scope] == Scopes::SCOPE_PUBLIC ? everybody_api_files_path : api_files_path
      https_apps_client.nodes_unlock(unsafe_params[:ids])
      render json: { path: path }, adapter: :json
    end
  end
end
