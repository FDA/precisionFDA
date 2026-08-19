module Api
  # Jobs API controller.
  # rubocop:disable Metrics/ClassLength
  class JobsController < ApiController
    include SpaceConcern
    include CommonConcern
    include JobsConcern
    include Paginationable
    include Sortable
    include Scopes

    DOWNLOAD_ACTION = "download".freeze
    PUBLISH_ACTION = "publish".freeze
    DELETE_ACTION = "delete".freeze
    COPY_ACTION = "copy".freeze
    COPY_TO_PRIVATE_ACTION = "copy_to_private".freeze

    ORDER_FIELDS = { # we use this order-fields Hash for simple filtering (JobService::JobFilter)
      "created_at" => %w(created_at),
      # launched_on is special-cased in `order_from_params` to use a single
      # COALESCE(analyses.created_at, jobs.created_at) expression so SQL ordering
      # matches the value displayed in `render_jobs_list`. The marker column name
      # below is only used to keep the key recognized as a valid order option.
      "launched_on" => %w(launched_on),
      "name" => %w(name),
      "app_title" => %w(apps.title),
      "username" => %w(users.first_name users.last_name),
      "workflow" => %w(workflows.title),
    }.freeze

    # Subset of ORDER_FIELDS keys whose SQL ordering preserves the
    # "jobs of the same analysis are adjacent" invariant that `render_jobs_list`
    # relies on to group workflow executions. Any other key must be sorted in
    # memory after grouping (see `should_sort_in_memory?`).
    #
    # NOTE: `created_at` is intentionally NOT listed here. SQL-ordering by
    # `jobs.created_at` would interleave jobs from different analyses and emit
    # the same workflow execution as multiple partial rows. The in-memory
    # `SORT_FIELDS["created_at"]` comparator (which uses `created_at_date_time`,
    # available on both JobSerializer and WorkflowSerializer) is used instead,
    # while SQL ordering falls back to `default_chronological_order`
    # (COALESCE(analyses.created_at, jobs.created_at)) to keep analysis jobs
    # adjacent before grouping.
    SQL_SAFE_ORDER_KEYS = %w(launched_on).freeze

    SORT_FIELDS = { # additional sorting for grouped and serialized values (see render_jobs_list)
      "created_at" => ->(left, right) { left.created_at_date_time <=> right.created_at_date_time },
      "launched_on" => ->(left, right) { left.launched_on <=> right.launched_on },
      "name" => ->(left, right) { left.name <=> right.name },
      "app_title" => ->(left, right) { left.app_title <=> right.app_title },
      "username" => ->(left, right) { left.launched_by <=> right.launched_by },
      "location" => ->(left, right) { left.location.downcase <=> right.location.downcase },
      "energy" => lambda { |left, right|
        extract = ->(obj) {
          val = obj.energy_consumption
          val == "N/A" ? -1 : val.delete("$").to_f
        }
        extract.call(left) <=> extract.call(right)
      },
    }.freeze

    # GET /api/jobs or GET /api/jobs?space_id=params[:space_id]
    # api_jobs_path
    # A common Job fetch method for space and home pages, depends upon @params[:space_id].
    # @param space_id [Integer] Space id for jobs fetch. When it is nil, then fetching for
    #   all jobs, editable by current user.
    # @param order_by, order_dir [String] Params for ordering.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    # rubocop:disable Metrics/MethodLength
    def index
      # Fetches space jobs.
      if params[:space_id]
        jobs = []
        if find_user_space
          jobs = @space.jobs.
            eager_load(:app, user: :org, analysis: :workflow).
            includes(:taggings).
            search_by_tags(params.dig(:filters, :tags))

          jobs = jobs.left_outer_joins(:properties).order(create_property_order) if params[:order_by_property]

          jobs = JobService::JobsFilter.call(jobs, params[:filters])
          jobs = jobs.order(order_params) unless params[:order_by_property]
        end

        render_jobs_list(jobs)
      else
        # Fetches all user 'private' jobs.
        jobs = Job.
          editable_by(@context).
          accessible_by_private.
          eager_load(:app, user: :org, analysis: :workflow).
          includes(:taggings).
          search_by_tags(params.dig(:filters, :tags))

        jobs = jobs.left_outer_joins(:properties).order(create_property_order) if params[:order_by_property]

        jobs = JobService::JobsFilter.call(jobs, params[:filters])
        jobs = jobs.order(order_params) unless params[:order_by_property]

        render_jobs_list(jobs)
      end
    end
    # rubocop:enable Metrics/MethodLength

    # GET /api/jobs/featured
    # A fetch method for jobs, accessible by public and with admin taggings.
    # @param created_at [String] Param for ordering.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    def featured
      jobs = Job.featured.
        accessible_by_public.
        eager_load(:app, user: :org, analysis: :workflow).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags))

      jobs = jobs.left_outer_joins(:properties).order(create_property_order) if params[:order_by_property]
      jobs = JobService::JobsFilter.call(jobs, params[:filters])
      jobs = jobs.order(order_params) unless params[:order_by_property]

      render_jobs_list(jobs)
    end

    # GET /api/jobs/everybody
    # A fetch method for jobs, accessible by public.
    # Fetches all user 'public' jobs.
    # @param created_at [String] Param for ordering.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    def everybody
      jobs = Job.
        accessible_by_public.
        eager_load(:app, user: :org, analysis: :workflow).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags))

      jobs = jobs.left_outer_joins(:properties).order(create_property_order) if params[:order_by_property]

      jobs = JobService::JobsFilter.call(jobs, params[:filters])
      jobs = jobs.order(order_params) unless params[:order_by_property]

      render_jobs_list(jobs)
    end

    # GET /api/workflows/:id/jobs
    # A fetch method for jobs from apps.
    # @param uid [Integer] Param for Workflows fetch.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    def workflow
      workflow = Workflow.find_by(uid: unsafe_params[:id])
      analyses = workflow.analyses.
        eager_load(:jobs, :workflow, :batch_items).
        order({ created_at: Sortable::DIRECTION_DESC })

      presenter = Presenters::WorkflowExecutionsPresenter.
        new(analyses, @context, unsafe_params).call
      payload = { jobs: presenter.response, meta: pagination_meta(presenter.size) }

      render json: payload, adapter: :json
    rescue StandardError => e
      raise ApiError, Message.bad_request(e.message)
    end

    # GET /api/apps/:id/jobs
    # A fetch method for jobs from apps.
    # @param uid [Integer] Param for App fetch.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    def app
      jobs = App.find_by(uid: unsafe_params[:id]).
        app_series.jobs.accessible_by(@context).
        eager_load(:app, user: :org, analysis: :workflow).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags))

      if params[:order_by_property]
        jobs = jobs.left_outer_joins(:properties).order(create_property_order).per(page_size)
      elsif params[:order_by] == "energy"
        jobs = jobs.order(energy_order_sql).page(page_from_params).per(page_size)
      else
        jobs = jobs.order(order_from_params).page(page_from_params).per(page_size)
      end

      jobs = JobService::JobsFilter.call(jobs, params[:filters])
      jobs.each { |job| job.current_user = @context.user }

      page_dict = pagination_dict(jobs)

      render json: jobs, root: Job.model_name.plural,
             meta: { count: page_dict[:total_count], pagination: page_dict },
             adapter: :json
    end

    # GET /api/jobs/spaces
    # A fetch method for jobs, accessible by user and of 'space' scope.
    # @param created_at [String] Param for ordering.
    # @return jobs [UserFile] Array of UserFile objects,
    #   which scope is not 'private' or 'public', i.e.
    #   jobs scope is one of 'space-...', if they exist OR jobs: [].
    def spaces
      jobs = Job.where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        accessible_by_user(@context.user).
        eager_load(:app, user: :org, analysis: :workflow).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags))

      jobs = jobs.left_outer_joins(:properties).order(create_property_order) if params[:order_by_property]

      jobs = JobService::JobsFilter.call(jobs, params[:filters])
      jobs = jobs.order(order_params) unless params[:order_by_property]

      render_jobs_list(jobs)
    rescue StandardError => e
      raise ApiError, Message.bad_request(e.message)
    end

    # rubocop:disable Metrics/MethodLength

    # POST /api/jobs/terminate terminate_api_jobs_path
    # Provide a call to DNAnexusAPI - to terminate an accessible job.
    # @param id [Integer] Param for job fetch.
    def terminate
      service = Jobs::TerminateService.call(unsafe_params.dig(:job, :id), @context)
      raise ApiError, service.message unless service.success?

      render json: { message: { type: service.status, text: service.message } }
    end

    # POST /api/jobs/copy
    # Copies selected jobs to another scope (space, public, private).
    def copy
      copies = CopyService::Copies.new
      Job.accessible_by(@context).where(uid: params[:item_ids]).each do |job|
        copies.push(object: job_copier.copy(job, params[:scope]), source: nil)
      end

      render json: copies.all, root: Job.model_name.plural, adapter: :json,
             meta: { messages: build_copy_messages(copies) }
    end

    def cli_jobs
      # Fetches space jobs.
      if params[:space_id]
        jobs = []
        if find_user_space
          jobs = @space.jobs.
            eager_load(:app, user: :org, analysis: :workflow).
            includes(:taggings).
            search_by_tags(params.dig(:filters, :tags)).
            order(order_params).page(page_from_params).per(page_size)
          jobs.each { |job| job.current_user = @context.user }

          jobs = JobService::JobsFilter.call(jobs, params[:filters])
        end

        render json: jobs, each_serializer: CliJobSerializer
      elsif params[:public_scope] == "true"
        # Fetches all 'public' jobs.
        jobs = Job.
          accessible_by_public.
          eager_load(:app, user: :org, analysis: :workflow).
          includes(:taggings).
          search_by_tags(params.dig(:filters, :tags))
        jobs = JobService::JobsFilter.call(jobs, params[:filters])
        render json: jobs, each_serializer: CliJobSerializer
      else
        # Fetches all user 'private' jobs.
        jobs = Job.
          editable_by(@context).
          accessible_by_private.
          eager_load(:app, user: :org, analysis: :workflow).
          includes(:taggings).
          search_by_tags(params.dig(:filters, :tags))

        jobs = JobService::JobsFilter.call(jobs, params[:filters])
        render json: jobs, each_serializer: CliJobSerializer
      end
    end

    def describe
      response = https_apps_client.describe(params[:id])
      render json: response, adapter: :json
    end

    private

    # Default to reverse chronological order unless overriden by params.
    # When a sort key is requested that we sort in memory (after workflow
    # grouping in `render_jobs_list`), we still need a SQL ordering that keeps
    # jobs of the same analysis adjacent, otherwise grouping would emit one
    # workflow execution as several partial rows. Fall back to the displayed
    # launched_on expression for that purpose.
    def order_params
      # NOTE: `energy` is intentionally not short-circuited to `energy_order_sql`
      # here. The `render_jobs_list` flows group consecutive jobs by analysis,
      # so applying per-job cost ordering in SQL can interleave jobs from
      # different analyses and emit one workflow execution as multiple partial
      # rows. Instead, fall through to `default_chronological_order` (which
      # keeps analysis jobs adjacent) and let `should_sort_in_memory?` sort the
      # already-grouped serialized rows via `SORT_FIELDS["energy"]`.
      requested_key = params[:order_by].to_s
      if requested_key.present? && !self.class::SQL_SAFE_ORDER_KEYS.include?(requested_key)
        return default_chronological_order
      end

      order = order_from_params
      order.presence || default_chronological_order
    end

    # SQL ordering used for the displayed `launched_on` column and as the
    # grouping-preserving default. Matches `job.analysis&.created_at || job.created_at`
    # used in `render_jobs_list` and is therefore stable across pagination.
    #
    # An `analyses.id` tie-breaker is added before `jobs.id` so that when two
    # different analyses share the same `created_at` timestamp, their jobs
    # never interleave. Without it, jobs from analysis A and analysis B could
    # be ordered A1, B1, A2, B2 by `jobs.id` alone, causing `render_jobs_list`
    # (which only merges *consecutive* same-analysis jobs) to emit each
    # workflow execution as multiple partial rows. NULL `analyses.id` values
    # (standalone jobs) cluster together, preserving existing behavior.
    def default_chronological_order
      Arel.sql(
        "COALESCE(analyses.created_at, jobs.created_at) #{Sortable::DIRECTION_DESC}, " \
        "analyses.id #{Sortable::DIRECTION_DESC}, " \
        "jobs.id #{Sortable::DIRECTION_DESC}",
      )
    end

    # Use JobsController ORDER_FIELDS instead of Sortable concern defaults.
    # The concern map does not include execution-specific keys (e.g. launched_on/app_title).
    def order_from_params(default_order = "launched_on")
      order_fields = self.class::ORDER_FIELDS
      order_field_values = order_fields.values.flatten
      order_by_key = params[:order_by].presence_in(order_fields.keys) || default_order
      order_dir = order_direction(params[:order_dir])

      # launched_on is rendered as COALESCE(analyses.created_at, jobs.created_at);
      # use the same expression for SQL ordering so that the displayed value and
      # the row order match exactly. `analyses.id` is added as a tie-breaker
      # before `jobs.id` so analyses sharing the same `created_at` do not
      # interleave their jobs (see `default_chronological_order`).
      #
      # Brakeman flags this Arel.sql as SQL injection; ignored in
      # config/brakeman.ignore because `order_dir` is always a frozen
      # "ASC"/"DESC" constant from `Sortable#order_direction`, never raw params.
      if order_by_key == "launched_on"
        return Arel.sql(
          "COALESCE(analyses.created_at, jobs.created_at) #{order_dir}, " \
          "analyses.id #{order_dir}, " \
          "jobs.id #{order_dir}",
        )
      end

      order_query(order_fields[order_by_key], order_dir, order_field_values)
    end

    # Most list ordering now happens in SQL. We only sort in memory for sort
    # keys whose SQL ordering would either be missing (e.g. `location` is not in
    # ORDER_FIELDS) or would break the analysis grouping performed by
    # `render_jobs_list` (e.g. `name`, `app_title`, `username`).
    def should_sort_in_memory?
      return false if params[:order_by_property]
      return false if params[:order_by].blank?

      sort_key = params[:order_by].to_s
      return false unless self.class::SORT_FIELDS.key?(sort_key)

      !self.class::SQL_SAFE_ORDER_KEYS.include?(sort_key)
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

    # Returns an Arel SQL node for ordering by cost extracted from the JSON describe column.
    # Jobs without totalPrice (NULL or missing key) sort as -1 to appear at the boundary.
    def energy_order_sql
      base = "COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(jobs.describe, '$.totalPrice')) AS DECIMAL(10,3)), -1)"
      if order_direction(params[:order_dir]) == Sortable::DIRECTION_ASC
        Arel.sql("#{base} ASC")
      else
        Arel.sql("#{base} DESC")
      end
    end

    # A common method for apps list json rendering.
    # Added a virtual attribute `current_user` - to use in serializer
    # @param jobs [Array] Array of Job objects.
    # @return array [Array] Array of 1. workflow + its jobs Workflow[Jobs]
    # or 2. just single job [Job]
    # rubocop:disable Metrics/MethodLength
    def render_jobs_list(jobs)
      jobs_size = jobs.size

      render :plain && (return jobs_size) if show_count

      workflow_with_jobs = []
      workflow_batch = {}

      jobs.each do |job|
        analysis = job&.analysis
        job.current_user = current_user
        workflow = analysis&.workflow
        slot = workflow_with_jobs.last

        if slot.nil? || slot[:analysis_dxid] != analysis&.dxid ||
           slot[:workflow]&.dxid != workflow&.dxid
          workflow_with_jobs << { analysis_dxid: analysis&.dxid,
                                  batch_id: analysis&.batch_id,
                                  workflow: workflow, jobs: [job] }
          fill_batch_with_workflows(workflow_batch, workflow, analysis)
        else
          slot[:jobs] << job
        end
      end

      workflow_with_jobs.map! do |slot|
        if slot[:workflow].nil?
          slot[:jobs].map do |job|
            job_serialized = JobSerializer.new(job)
            job_serialized.launched_on = job.analysis&.created_at || job.created_at
            job_serialized
          end
        else
          slot[:workflow].current_user = current_user

          workflow_serialized = WorkflowSerializer.new(slot[:workflow])
          number_workflows_in_batch(workflow_batch[slot[:batch_id]],
                                    workflow_serialized, slot[:analysis_dxid])
          workflow_serialized.jobs = slot[:jobs].map do |job|
            job_serialized = JobSerializer.new(job)

            launched_on = job.analysis&.created_at || job.created_at
            job_serialized.launched_on = launched_on
            if workflow_serialized.launched_on.nil? ||
               launched_on < workflow_serialized.launched_on
              workflow_serialized.launched_on = launched_on
            end

            job_serialized
          end

          workflow_serialized.launched_on ||= Time.current
          workflow_serialized
        end
      end.flatten!

      workflow_with_jobs = sort_array_by_fields(workflow_with_jobs) if should_sort_in_memory?
      page_array = paginate_array(workflow_with_jobs)
      page_meta = pagination_meta(workflow_with_jobs.count)

      page_meta[:pagination][:total_count] = jobs_size
      page_meta[:count] = jobs_size

      render json: { jobs: page_array, meta: page_meta }, adapter: :json
    end
    # rubocop:enable Metrics/MethodLength

    def job_copier
      @job_copier ||= CopyService::JobCopier.new(api: @context.api, user: current_user)
    end

    # Builds response notifications for the copy action.
    # @param copies [CopyService::Copies] Copies
    # @return [Array<Hash>] Array of notifications.
    # rubocop:disable Metrics/MethodLength
    def build_copy_messages(copies)
      messages = []

      copied_count = copies.select(&:copied).size
      if copied_count.positive?
        messages << {
          type: "success",
          message: I18n.t("api.jobs.copy.success", count: copied_count),
        }
      end

      not_copied_jobs = copies.reject(&:copied).map(&:object)
      if not_copied_jobs.present?
        messages << {
          type: "warning",
          message: I18n.t("api.jobs.copy.jobs_not_copied",
                          count: not_copied_jobs.size,
                          jobs: not_copied_jobs.map(&:name).join(", ")),
        }
      end

      messages
    end

    def can_copy_to_scope?
      scope = params[:scope]

      return if [Scopes::SCOPE_PUBLIC, Scopes::SCOPE_PRIVATE].include?(params[:scope])

      space = Space.from_scope(scope) if Space.valid_scope?(scope)

      raise ApiError, "Scope parameter is incorrect (can be public or space-x)" unless space

      return if space.editable_by?(current_user)

      raise ApiError, "You have no permissions to copy jobs to the scope '#{scope}'"
    end

    # Insert into batch key(analysis uid) - value(sorted by created
    #  date list of workflow uid) pairs
    # @param workflow_batch [Hash] Batch to fill
    # @param workflow [Workflow] Workflow
    # @param analysis [Analysis] Analysis
    def fill_batch_with_workflows(workflow_batch, workflow, analysis)
      return unless workflow.present? && analysis&.batch_id.present?

      new_item = { workflow_uid: workflow.uid,
                   analysis_dxid: analysis.dxid,
                   created_at: analysis.created_at }
      workflow_batch[analysis.batch_id] = [] unless workflow_batch.key? analysis.batch_id

      batch = workflow_batch[analysis.batch_id]
      insert_at = batch.bsearch_index do |item|
        item[:created_at] > new_item[:created_at]
      end || batch.size

      workflow_batch[analysis.batch_id].insert(insert_at, new_item)
    end

    def order_dir
      unsafe_params[:order_dir] || :DESC
    end

    # Enumerate Workflow title based on batch side (like "Title (1 of 3)")
    # @param batch [Array] array with workflow_id ordered by created_at
    # @param serialized_workflow [WorkflowSerializer] Serialized version of WorkFlow
    def number_workflows_in_batch(batch, serialized_workflow, analysis_dxid)
      return if batch.blank?

      index = batch.index do |item|
        (item[:workflow_uid] == serialized_workflow.uid) &&
          (item[:analysis_dxid] == analysis_dxid)
      end
      serialized_workflow.title += " (#{index + 1} of #{batch.size})"
    end
    # rubocop:enable Metrics/MethodLength
  end
  # rubocop:enable Metrics/ClassLength
end
