module Api
  # Home Workflows controller.
  class WorkflowsController < ApiController
    before_action :can_copy_to_scope?, only: %i(copy)

    include Sortable
    include CommonConcern
    include Paginationable
    include SpaceConcern
    include Scopes

    # GET /api/workflows
    # A common Workflow fetch method for space and home pages, depends upon @params[:space_id].
    # @param space_id [Integer] Space id for workflows fetch. When it is nil, then fetching for
    #   all workflows, editable by current user.
    # @param order_by, order_dir [String] Params for ordering.
    # @return workflows [App] Array of workflows objects if they exist OR workflows: [].
    # rubocop:disable Metrics/MethodLength
    def index
      filters = params[:filters]

      if params[:space_id]
        workflows = []

        if find_user_space
          workflows = @space.latest_revision_workflows.unremoved.
            eager_load(:workflow_series, :user).includes(:taggings)

          workflows = workflows.includes(workflow_series: :properties).order(create_property_order) if params[:order_by_property]

          workflows = filter_workflows(workflows, filters)
          workflows.each { |workflow| workflow.current_user = @context.user }
          workflows = sort_array_by_fields(workflows) unless params[:order_by_property]
          page_meta = pagination_meta(workflows.count)
          workflows = paginate_array(workflows)
        end

        page_dict = pagination_dict(workflows)

        if show_count
          render plain: page_dict[:total_count]
        else
          render json: workflows,
                 root: Workflow.model_name.plural,
                 meta: workflows_meta.merge(page_meta),
                 adapter: :json
        end

        return
      end

      workflows = WorkflowSeries.accessible_by(@context).
        eager_load(latest_revision_workflow: [user: :org]).
        accessible_by_private.unremoved.
        includes(latest_revision_workflow: [user: :org]).
        includes(:taggings)

      if params[:order_by_property]
        workflows = workflows.left_outer_joins(:properties).order(create_property_order)
      else
        workflows = workflows.order(order_from_params)
      end

      workflows = workflows.
        map do |series|
          latest = series.latest_accessible(@context)
          latest if Workflows::WorkflowFilter.match(latest, filters)
        end.compact

      render_workflows_list workflows
    end

    # rubocop:enable Metrics/MethodLength

    # GET /api/workflows/featured
    # A fetch method for workflows, accessible by public and with user taggings.
    # @param order_by, order_dir [String] Params for ordering.
    # @return workflows [App] Array of Workflow objects if they exist OR workflows: [].
    def featured
      filters = params[:filters]
      workflows = WorkflowSeries.featured.unremoved.
        accessible_by_public.eager_load(:user, :taggings).
        search_by_tags(params.dig(:filters, :tags))

      if params[:order_by_property]
        workflows = workflows.left_outer_joins(:properties).order(create_property_order)
      else
        workflows = workflows.order(order_from_params)
      end

      workflows = workflows.map do |series|
          latest = series.latest_accessible(@context)
          latest if Workflows::WorkflowFilter.match(latest, filters)
        end.compact

      render_workflows_list workflows
    end

    def everybody
      filters = params[:filters]
      workflows = WorkflowSeries.unremoved.
        accessible_by_public.
        eager_load(latest_revision_workflow: [user: :org]).includes(:taggings)

      if params[:order_by_property]
        workflows = workflows.left_outer_joins(:properties).order(create_property_order)
      else
        workflows = workflows.order(order_from_params)
      end

      workflows = workflows.map do |series|
        latest = series.latest_accessible(@context)
        latest if Workflows::WorkflowFilter.match(latest, filters)
      end.compact
      
      render_workflows_list workflows
    end

    # GET /api/workflows/spaces
    # Apps fetch method for workflows, accessible by user and of 'space' scope.
    # @param order_by, order_dir [String] Params for ordering.
    # @return workflows [App] Array of Workflow objects,
    #   which scope is not 'private' or 'public', i.e.
    #   workflows scope is one of 'space-...', if they exist OR workflows: [].
    def spaces
      workflows = WorkflowSeries.accessible_by(@context).
        eager_load(latest_revision_workflow: [user: :org]).
        where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        unremoved.includes(:taggings).
        map do |series|
          series_wf = series.latest_accessible(@context)
          if series_wf.in_space? && Workflows::WorkflowFilter.
              match(series_wf, params[:filters])
            series_wf
          end
        end.compact

      render_workflows_list workflows
    end

    # GET /api/workflows/:id (show)
    # Workflows fetch method for workflow, accessible by user.
    # @param id [String] uid of Workflow object.
    # @return workflow [Workflow] Workflow object, with its connected data.
    def show
      find_workflow
      comments_data(@workflow)
      revisions_data
      analyses = workflow_analyses(@workflow, :desc)
      @workflow.current_user = current_user

      render json:
        @workflow, adapter: :json,
        meta:  {
          spec: @workflow.spec,
          apps: @workflow.apps,
          revisions: @revisions,
          executions: [],
          batches: [],
          challenges: @assignable_challenges,
          comments: @comments,
          links: meta_links(@workflow),
        }
    end

    # GET /api/workflows/:id/licenses_to_accept
    # gets licenses to be accepted
    # @param id [String] uid of Workflow object.
    # @return object containing two arrays (licenses_to_accept and accepted_licenses)
    def licenses_to_accept
      workflow_uid = unsafe_params[:workflow_id]
      licenses = https_apps_client.workflow_licenses_to_accept(workflow_uid)
      render json: licenses
    rescue HttpsAppsClient::Error => e
      response[:errors] << e.message
    end

    # Workflow analyses jobs and Batch hash
    # @param workflow [Workflow object]
    # @param direction [String] - order direction: 'asc', 'desc'
    # @return analyses [Hash] - Hash object with { analyses_jobs } and { batch_hash }
    def workflow_analyses(workflow, direction)
      analyses = {}
      a = Analysis.arel_table
      batch_ids =
        ActiveRecord::Base.
          connection.
          execute("select min(id) from analyses where batch_id is not null group by batch_id").
          to_a.flatten
      all_analyses = workflow.analyses.editable_by(@context).
        where(a["batch_id"].eq(nil).or(a["id"].in(batch_ids))).
        order(created_at: direction)

      analyses[:batch_hash] = Analysis.
        batch_hash(all_analyses.where("analyses.batch_id is not NULL"))
      analyses[:analyses_jobs] = Analysis.
        job_hash(all_analyses.where(batch_id: nil))

      analyses
    end

    # Copies workflows to another scope.
    def copy
      workflows = Workflow.accessible_by(@context).where(id: params[:item_ids])

      new_workflows = workflows.map { |wf| copy_service.copy(wf, params[:scope]).first }

      # TODO: change old UI to handle json-response!
      respond_to do |format|
        format.html do
          redirect_to pathify(workflows.first),
                      success: "The workflow has been published successfully!"
        end

        format.json { render json: new_workflows, root: Workflow.model_name.plural, adapter: :json }
      end
    rescue StandardError => e
      raise ApiError, Message.bad_request(e.message)
    end

    # POST /api/workflows
    def create
      ActiveRecord::Base.transaction do
        if presenter.valid?
          workflow = Workflows::Builder.call(presenter)
          render json: { id: workflow.uid, asset_uids: presenter.assets.map(&:uid) }
        else
          render json: { error: { message: presenter.errors.full_messages.first } },
                 status: :unprocessable_entity
        end
      end
    rescue StandardError => e
      logger.error(e.backtrace.unshift(e.message).join("\n"))

      message = if presenter.is_a?(Workflow::CwlPresenter) && e.message.include?("line")
        e.message.split(":").last.strip
      else
        e.message
      end

      render json: { error: { message: message } }, status: :unprocessable_entity
    end

    def diagram
      workflow = Workflow.accessible_by(@context).find_by!(uid: unsafe_params[:id])

      render json: WorkflowDiagramPresenter.call(workflow)
    rescue ActiveRecord::RecordNotFound => e
      raise ApiError, Message.bad_request(e.message)
    end

    def describe
      find_workflow # check if workflow accesible by current user first
      response = https_apps_client.describe(params[:id])
      render json: response
    end

    def cli_workflows
      workflows = []

      # use find_space instead? try behavior of CLI of non-existing or non-accessible space..
      if params[:space_id]
        if find_user_space
          workflows = @space.latest_revision_workflows.unremoved.
            eager_load(:workflow_series, :user).includes(:taggings)
        end
      elsif params[:public_scope] == "true"
        workflows = WorkflowSeries.unremoved.
          accessible_by_public.
          eager_load(latest_revision_workflow: [user: :org]).includes(:taggings)
      else
        workflows = WorkflowSeries.accessible_by(@context).
          eager_load(latest_revision_workflow: [user: :org]).
          accessible_by_private.unremoved.
          includes(latest_revision_workflow: [user: :org]).
          includes(:taggings)
      end
      workflows.order(created_at: :desc)
      workflows = workflows.
        map do |series|
        series.latest_accessible(@context)
      end.compact

      render json: workflows, each_serializer: CliWorkflowSerializer
    end

    private

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

    def filter_workflows(workflows, filters)
      workflows.map do |workflow|
        if Workflows::WorkflowFilter.
            match(workflow, filters)
          workflow
        end
      end.compact
    end

    def render_workflows_list(workflows)
      if show_count
        render plain: workflows.count
      else
        workflows.each { |workflow| workflow.current_user = @context.user }
        page_meta = pagination_meta(workflows.count)
        workflows = paginate_array(workflows)

        render json: workflows, meta: page_meta, root: Workflow.model_name.plural, adapter: :json
      end
    end

    def presenter
      @presenter ||= begin
        klass = if unsafe_params[:file]
          unsafe_params[:format] == "wdl" ? Workflow::WdlPresenter : Workflow::CwlPresenter
        else
          Workflow::Presenter
        end

        klass.new(unsafe_params, @context)
      end
    end

    def copy_service
      @copy_service ||= CopyService.new(api: @context.api, user: current_user)
    end

    def can_copy_to_scope?
      scope = params[:scope]

      return if scope == Scopes::SCOPE_PUBLIC

      space = Space.from_scope(scope) if Space.valid_scope?(scope)

      raise ApiError, "Scope parameter is incorrect (can be public or space-x)" unless space

      return if space.editable_by?(current_user)

      raise ApiError, "You have no permissions to copy apps to the scope '#{scope}'"
    end
  end
end