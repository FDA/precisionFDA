module Api
  # DB Clusters API controller.
  class DbClustersController < ApiController
    include Paginationable
    include Sortable

    before_action :find_db_cluster, only: %i(show update)
    # TODO(samuel) disabled now wait until database resources are specified in next iteration of cloud governance
    # before_action :check_total_charges_limit, only: %i(create)

    rescue_from DXClient::Errors::DXClientError,
                HttpsAppsClient::Error,
                with: :render_error

    ORDER_FIELDS = {
      "name" => "name",
      "status" => "status",
      "engine" => "engine",
      "instance" => "dx_instance_class",
      "created_at" => "created_at",
    }.freeze

    def index
      dbclusters = DbCluster.accessible_by_user(current_user).
        includes(:user).
        search_by_tags(params.dig(:filters, :tags))

      if params[:order_by_property]
        dbclusters = dbclusters.left_outer_joins(:properties).order(create_property_order).page(page_from_params).per(page_size)
      else
        dbclusters = dbclusters.order(order_from_params).page(page_from_params).per(page_size)
      end

      dbclusters = DbClusters::Filter.call(dbclusters, params[:filters])

      page_dict = pagination_dict(dbclusters.reload)

      return render(plain: page_dict[:total_count]) if show_count

      render json: dbclusters,
             meta: count(page_dict[:total_count]).merge({ pagination: page_dict }),
             root: "dbclusters",
             adapter: :json
    end

    def everybody; end

    def featured; end

    def spaces; end

    def show
      render json: @dbcluster, adapter: :json
    end

    def create
      opts = dbcluster_create_params.merge(
        project: current_user.private_files_project,
        scope: Scopes::SCOPE_PRIVATE,
      ).except(:ddl_file_uid)
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
                                         :engineVersion, :dxInstanceClass, :ddl_file_uid)
    end

    def dbcluster_update_params
      params.require(:db_cluster).permit(:name, :description)
    end

    def order_from_params(default_order = "created_at")
      if %w(status engine instance).include?(params[:order_by])
        query = DbCluster.order_by_enum_query(
          ORDER_FIELDS[params[:order_by] || default_order],
          order_direction(params[:order_dir]),
          params[:order_by] == "instance" ? DbCluster::DX_INSTANCE_CLASSES.invert : nil,
        )
        return Arel.sql(query)
      end

      { created_at: Sortable::DIRECTION_DESC }
    end

    def create_property_order
      properties_table = Arel::Table.new(:properties)
      property_order = ActiveRecord::Base.sanitize_sql(params[:order_by_property])
      order_dir = params[:order_dir].upcase == "ASC" ? "ASC" : "DESC"

      order_by_case = Arel::Nodes::Case.new(properties_table[:property_name]).when(property_order).then(0).else(1)
      order_by_property_value = properties_table[:property_value].send(order_dir.downcase.to_sym)

      # It will produce something like this - easier to understand for node migration later:
      # CASE WHEN properties.property_name = #{params[:order_by_property]} THEN 0 ELSE 1 END, properties.property_value #{params[:order_dir]}
      [order_by_case, order_by_property_value]
    end

    def render_error(exception)
      json = { error: { type: "Error", code: exception.error_code, message: exception.message } }
      render json: json, status: :unprocessable_entity
    end
  end
end
