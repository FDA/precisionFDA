module Api
  # DB Clusters API controller.
  class DbClustersController < ApiController
    include Paginationable
    include Sortable

    before_action :find_db_cluster, only: %i(show update)

    rescue_from DXClient::Errors::DXClientError,
                HttpsAppsClient::Error,
                with: :render_error

    ORDER_FIELDS = {
      "name" => "name",
      "status" => "status",
      "engine" => "engine",
      "instance" => "dx_instance_class",
      "created" => "created_at",
    }.freeze

    def index
      dbclusters = DbCluster.accessible_by_user(current_user).
        includes(:user).
        search_by_tags(params.dig(:filters, :tags)).
        order(order_from_params).
        page(page_from_params)

      dbclusters = DbClusters::Filter.call(dbclusters, params[:filters])

      page_dict = pagination_dict(dbclusters.reload)

      return render(plain: page_dict[:total_count]) if show_count

      dbclusters.find_each do |dbcluster|
        DbClusters::Synchronizer.call(user_api, dbcluster, with_delete: false)
      end

      render json: dbclusters,
             meta: count(page_dict[:total_count]).merge({ pagination: page_dict }),
             root: "dbclusters",
             adapter: :json
    end

    def everybody; end

    def featured; end

    def spaces; end

    def show
      DbClusters::Synchronizer.call(user_api, @dbcluster, with_delete: false)

      render json: @dbcluster, adapter: :json
    end

    def create
      opts = dbcluster_create_params.merge(
        project: current_user.private_files_project,
        scope: Scopes::SCOPE_PRIVATE,
      ).except(:ddl_file_uid)
      opts[:name]&.strip!

      response = https_apps_client.dbclusters_create(opts)
      dbcluster = DbCluster.find_by!(dxid: response[:dxid])

      render json: dbcluster, adapter: :json
    end

    def update
      @dbcluster.assign_attributes(dbcluster_update_params)
      @dbcluster.save!

      render json: @dbcluster, adapter: :json
    end

    # Used for start, stop and terminate actions.
    def run
      https_apps_client.send("dbclusters_#{params[:api_method]}", params[:dxids])

      render json: {}, status: :no_content
    end

    private

    def https_apps_client
      DIContainer.resolve("https_apps_client")
    end

    def user_api
      DIContainer.resolve("api.user")
    end

    def find_db_cluster
      @dbcluster = DbCluster.accessible_by_user(current_user).find_by(dxid: params[:dxid])

      raise ApiError, "#{params[:dxid]} is not found" unless @dbcluster
    end

    def dbcluster_create_params
      params.require(:db_cluster).permit(:name, :description, :adminPassword, :engine,
                                         :engineVersion, :dxInstanceClass, :ddl_file_uid)
    end

    def dbcluster_update_params
      params.require(:db_cluster).permit(:name, :description)
    end

    def order_from_params(default_order = "created")
      if %w(status engine instance).include?(params[:order_by])
        query = DbCluster.order_by_enum_query(
          ORDER_FIELDS[params[:order_by]],
          order_direction(params[:order_dir]),
          params[:order_by] == "instance" ? DbCluster::DX_INSTANCE_CLASSES.invert : nil,
        )
        return Arel.sql(query)
      end

      super
    end

    def render_error(exception)
      json = { error: { type: "Error", code: exception.error_code, message: exception.message } }
      render json: json, status: :unprocessable_entity
    end
  end
end
