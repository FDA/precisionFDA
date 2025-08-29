module Api
  # DB Clusters API controller.
  class DbClustersController < ApiController
    include Paginationable
    include Sortable
    include SpaceConcern
    include Scopes

    before_action :find_db_cluster, only: %i(update)
    # TODO(samuel) disabled now wait until database resources are specified in next iteration of cloud governance
    # before_action :check_total_charges_limit, only: %i(create)

    rescue_from DXClient::Errors::DXClientError,
                HttpsAppsClient::Error,
                with: :render_error

    def index
      dbclusters = []

      if params[:space_id]
        if find_user_space
          dbclusters = @space.dbclusters.includes(:taggings)
        end
      else
        dbclusters = DbCluster.unscoped.
          editable_by(@context).
          accessible_by_private.
          eager_load(user: :org).
          includes(:taggings).
          search_by_tags(params.dig(:filters, :tags))
      end

      dbclusters = dbclusters.order(order_from_params).page(page_from_params).per(page_size)

      dbclusters = DbClusters::Filter.call(dbclusters, params[:filters])

      page_dict = pagination_dict(dbclusters.reload)

      return page_dict[:total_count] if show_count

      render json: dbclusters,
             root: DbCluster.model_name.plural,
             adapter: :json,
             meta: db_clusters_meta.merge(
               count: page_dict[:total_count],
               pagination: page_dict,
             )
    end

    def everybody; end

    def featured; end

    def spaces
      dbclusters = DbCluster.unscoped.
        editable_by(@context).where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        eager_load(user: :org).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags))

        dbclusters = DbClusters::Filter.call(dbclusters, params[:filters]).to_a

      if show_count
        return dbclusters.count
      end
    end

    def create
      opts = dbcluster_create_params.merge(
        project: current_user.private_files_project,
        scope: Scopes::SCOPE_PRIVATE,
      )
      opts[:name]&.strip!

      response = https_apps_client.dbcluster_create(opts)
      dbcluster = DbCluster.find_by!(uid: response[:uid])

      render json: dbcluster, adapter: :json
    end

    def update
      # permission check is done in the @dbcluster initialization.
      https_apps_client.dbcluster_update(@dbcluster.uid, dbcluster_update_params)
      @dbcluster.reload

      render json: @dbcluster, adapter: :json
    end

    # Used for start, stop and terminate actions.
    def run
      https_apps_client.dbcluster_action(params[:dxids], params[:api_method])

      render json: {}, status: :no_content
    end

    def allowed_db_instances_by_user
      render json: user_database_resource_labels
    end

    private

    def find_db_cluster
      @dbcluster = DbCluster.accessible_by_user(current_user).find_by(uid: params[:uid])

      raise ApiError, "#{params[:uid]} is not found" unless @dbcluster
    end

    def dbcluster_create_params
      params.require(:db_cluster).permit(:name, :description, :adminPassword, :engine,
                                         :engineVersion, :dxInstanceClass)
    end

    def dbcluster_update_params
      params.require(:db_cluster).permit(:name, :description)
    end

    def render_error(exception)
      json = { error: { type: "Error", code: exception.error_code, message: exception.message } }
      render json: json, status: :unprocessable_entity
    end
  end
end
