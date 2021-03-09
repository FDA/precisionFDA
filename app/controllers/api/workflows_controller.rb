module Api
  # Home Workflows controller.
  class WorkflowsController < ApiController
    before_action :can_copy_to_scope?, only: %i(copy)

    include Sortable
    include CommonConcern
    include Paginationable
    include SpaceConcern
    include Scopes

    PAGE_SIZE = Paginationable::PAGE_SIZE

    # GET /api/workflows
    # A common Workflow fetch method for space and home pages, depends upon @params[:space_id].
    # @param space_id [Integer] Space id for workflows fetch. When it is nil, then fetching for
    #   all workflows, editable by current user.
    # @param order_by, order_dir [String] Params for ordering.
    # @return workflows [App] Array of workflows objects if they exist OR workflows: [].
    # rubocop:disable Metrics/MethodLength
    def index
      page_meta = {}
      workflows = []

      if params[:space_id]
        if find_user_space
          workflows = @space.workflows.unremoved.
            eager_load(:workflow_series, :user).includes(:taggings).
            search_by_tags(params.dig(:filters, :tags)).
            order(order_from_params).
            page(page_from_params).per(PAGE_SIZE)
          workflows = Workflows::WorkflowFilter.call(workflows, params[:filters])
          workflows.each { |workflow| workflow.current_user = @context.user }

          page_meta = { pagination: pagination_dict(workflows) }
        end

        render json: workflows, root: "workflows",
               meta: workflows_meta.merge(page_meta), adapter: :json
      else
        filters = params[:filters]
        workflows = WorkflowSeries.accessible_by(@context).
          eager_load(latest_revision_workflow: [user: :org]).
          accessible_by_private.unremoved.
          includes(latest_revision_workflow: [user: :org]).
          order(order_from_params).
          includes(:taggings).
          map do |series|
            latest = series.latest_accessible(@context)
            latest if Workflows::WorkflowFilter.match(latest, filters)
          end.compact
        workflows.each { |workflow| workflow.current_user = @context.user }

        workflows = sort_array_by_fields(workflows)
        page_meta = pagination_meta(workflows.count)
        workflows = paginate_array(workflows)

        render json: workflows, meta: page_meta, root: "workflows", adapter: :json
      end
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
        search_by_tags(params.dig(:filters, :tags)).map do |series|
          latest = series.latest_accessible(@context)
          latest if Workflows::WorkflowFilter.match(latest, filters)
        end.compact
      workflows.each { |workflow| workflow.current_user = @context.user }

      workflows = sort_array_by_fields(workflows)
      page_meta = pagination_meta(workflows.count)
      workflows = paginate_array(workflows)

      render json: workflows, meta: page_meta, root: "workflows", adapter: :json
    end

    # GET /api/workflows/everybody
    # A fetch method for workflows, accessible by public and of latest revisions.
    # @param order_by, order_dir [String] Params for ordering.
    # @return workflows [App] Array of Workflow objects if they exist OR workflows: [].
    def everybody
      filters = params[:filters]
      workflows = WorkflowSeries.
        unremoved.
        accessible_by_public.
        eager_load(latest_revision_workflow: [user: :org]).
        includes(:taggings).
        map do |series|
          latest = series.latest_accessible(@context)
          latest if Workflows::WorkflowFilter.match(latest, filters)
        end.compact
      workflows.each { |workflow| workflow.current_user = @context.user }

      workflows = sort_array_by_fields(workflows)
      page_meta = pagination_meta(workflows.count)
      workflows = paginate_array(workflows)

      render json: workflows, meta: page_meta, root: "workflows", adapter: :json
    end

    # GET /api/workflows/spaces
    # Apps fetch method for workflows, accessible by user and of 'space' scope.
    # @param order_by, order_dir [String] Params for ordering.
    # @return workflows [App] Array of Workflow objects,
    #   which scope is not 'private' or 'public', i.e.
    #   workflows scope is one of 'space-...', if they exist OR workflows: [].
    def spaces
      filters = params[:filters]
      workflows = WorkflowSeries.accessible_by(@context).
        eager_load(latest_revision_workflow: [user: :org]).
        where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        unremoved.includes(:taggings).
        order(order_from_params).
        map do |series|
          series_wf = series.latest_accessible(@context)
          if series_wf.in_space? && Workflows::WorkflowFilter.
              match(series_wf, filters)
            series_wf
          end
        end.compact
      workflows.each { |workflow| workflow.current_user = @context.user }

      workflows = sort_array_by_fields(workflows)
      page_meta = pagination_meta(workflows.count)
      workflows = paginate_array(workflows)

      render json: workflows, meta: page_meta, root: "workflows", adapter: :json
    end

    # GET /api/workflows/:id (show)
    # Workflows fetch method for workflow, accessible by user.
    # @param id [String] uid of Workflow object.
    # @return workflow [Workflow] Workflow object, with its connected data.
    def show
      find_workflow
      comments_data(@workflow)
      revisions_data
      jobs_sync
      analyses = workflow_analyses(@workflow, :desc)
      @workflow.current_user = current_user

      render json:
        @workflow, adapter: :json,
        meta:  {
          spec: @workflow.spec,
          apps: @workflow.apps,
          revisions: @revisions,
          executions: analyses[:analyses_jobs],
          batches: analyses[:batch_hash],
          challenges: @assignable_challenges,
          comments: @comments,
          links: meta_links(@workflow),
        }
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

        format.json { render json: new_workflows, root: "workflows", adapter: :json }
      end
    rescue StandardError => e
      raise ApiError, Message.bad_request(e.message)
    end

    def create
      ActiveRecord::Base.transaction do
        if presenter.valid?
          workflow = Workflows::Builder.call(presenter)
          render json: { id: workflow.uid, asset_uids: presenter.assets.map(&:uid) }
        else
          render json: { errors: presenter.errors.full_messages }, status: :unprocessable_entity
        end
      end
    rescue StandardError => e
      logger.error(e.backtrace.unshift(e.message).join("\n"))

      message = if presenter.is_a?(Workflow::CwlPresenter) && e.message.include?("line")
        e.message.split(":").last.strip
      else
        e.message
      end

      render json: { errors: [message] }, status: :unprocessable_entity
    end

    private

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
