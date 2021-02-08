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
      "name" => %w(name),
      "apptitle" => %w(apps.title),
      "username" => %w(users.first_name users.last_name),
    }.freeze

    ORDER_GROUP_FIELDS = { # we use this order-fields Hash for advanced filtering with grouping
      "analyses.batch_id" => Sortable::DIRECTION_DESC,
      "workflows.id" => Sortable::DIRECTION_DESC,
    }.freeze

    SORT_FIELDS = { # additional sorting for grouped and serialized values (see render_jobs_list)
      "created_at" => ->(left, right) { left.created_at_date_time <=> right.created_at_date_time },
      "launched_on" => ->(left, right) { left.launched_on <=> right.launched_on },
      "name" => ->(left, right) { left.name <=> right.name },
      "apptitle" => ->(left, right) { left.app_title <=> right.app_title },
      "username" => ->(left, right) { left.launched_by <=> right.launched_by },
    }.freeze

    PAGE_SIZE = Paginationable::PAGE_SIZE

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
            search_by_tags(params.dig(:filters, :tags)).
            order(order_from_params).page(page_from_params).per(PAGE_SIZE)
          jobs.each { |job| job.current_user = @context.user }

          jobs = JobService::JobsFilter.call(jobs, params[:filters])

          sync_jobs(jobs)
        end

        page_dict = pagination_dict(jobs)

        render json: jobs, root: "jobs", meta: count(page_dict[:total_count]).
          merge({ pagination: page_dict }), adapter: :json
      else
        # Fetches all user 'private' jobs.
        jobs = Job.
          editable_by(@context).
          accessible_by_private.
          eager_load(:app, user: :org, analysis: :workflow).
          includes(:taggings).
          search_by_tags(params.dig(:filters, :tags)).
          order(ORDER_GROUP_FIELDS)
        jobs = JobService::JobsFilter.call(jobs, params[:filters])

        render_jobs_list(jobs)
      end
    end
    # rubocop:enable Metrics/MethodLength

    # A common method for apps list json rendering.
    # Added a virtual attribute `current_user` - to use in serializer
    # @param jobs [Array] Array of Job objects.
    # @return array [Array] Array of 1. workflow + its jobs Workflow[Jobs]
    # or 2. just single job [Job]
    # rubocop:disable Metrics/MethodLength
    def render_jobs_list(jobs)
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

      page_array = paginate_array(sort_array_by_fields(workflow_with_jobs))
      page_meta = pagination_meta(workflow_with_jobs.count)
      page_meta[:count] = page_meta.dig(:pagination, :total_count)

      render json: { jobs: page_array, meta: page_meta }, adapter: :json
    end
    # rubocop:enable Metrics/MethodLength

    # Create meta data for jobs json
    # @param jobs [Array] Array of Job objects.
    def jobs_meta(jobs)
      { count: {} }.tap do |meta|
        # jobs count
        meta[:count] = jobs.count
      end
    end

    # GET /api/jobs/featured
    # A fetch method for jobs, accessible by public and with admin taggings.
    # @param created_at [String] Param for ordering.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    def featured
      jobs = Job.featured.
        accessible_by_public.
        eager_load(:app, user: :org, analysis: :workflow).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags)).
        order(ORDER_GROUP_FIELDS)
      jobs = JobService::JobsFilter.call(jobs, params[:filters])

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
        search_by_tags(params.dig(:filters, :tags)).
        order(ORDER_GROUP_FIELDS)
      jobs = JobService::JobsFilter.call(jobs, params[:filters])

      render_jobs_list(jobs)
    end

    # GET /api/apps/:id/jobs
    # A fetch method for jobs from apps.
    # @param uid [Integer] Param for App fetch.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    def app
      jobs = App.find_by(uid: unsafe_params[:id]).
        app_series.jobs.editable_by(@context).
        eager_load(:app, user: :org, analysis: :workflow).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags)).
        order(order_from_params).page(page_from_params).per(PAGE_SIZE)
      jobs.each { |job| job.current_user = @context.user }

      jobs = JobService::JobsFilter.call(jobs, params[:filters])

      page_dict = pagination_dict(jobs)

      render json: jobs, root: "jobs", meta: count(page_dict[:total_count]).
        merge({ pagination: page_dict }), adapter: :json
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
        search_by_tags(params.dig(:filters, :tags)).
        order(order_from_params)

      jobs = JobService::JobsFilter.call(jobs, params[:filters])

      render_jobs_list(jobs)
    rescue StandardError => e
      raise ApiError, Message.bad_request(e.message)
    end

    # GET /api/jobs/:id  api_job_path
    # A fetch method for job by file :id, accessible by user.
    # @param id [Integer] Param for job fetch.
    # @return job Job object with arrays of assosiated objects:
    #   notes, answers, comments, discussions, comparisons.
    # rubocop:disable Metrics/MethodLength
    def show
      find_job
      sync_job!
      load_relations(@job)
      comments_data(@job)
      @job.current_user = current_user

      @item_comments_path = pathify_comments(@job)

      render json:
               @job, adapter: :json,
             meta: {
               notes: @notes,
               answers: @answers,
               discussions: @discussions,
               comments: @comments,
               links: meta_links(@job),
             }
    end

    # POST /api/jobs/terminate terminate_api_jobs_path
    # Provide a call to DNAnexusAPI - to terminate an accessible job.
    # @param id [Integer] Param for job fetch.
    def terminate
      find_job
      if @job.nil?
        type = :error
        text = "Sorry, this job does not exist or is not accessible by you"
        path = api_jobs_path

        render json: { path: path, message: { type: type, text: text } }, adapter: :json
        return
      end
      if !@job.terminal?
        DNAnexusAPI.new(@context.token).call(@job.dxid, "terminate")
        type = :success
        text = "Job was successfully terminated"
      else
        type = :warning
        text = "Job is in terminal state and can not be terminated"
      end
      path = api_job_path(@job)

      render json: { path: path, message: { type: type, text: text } }, adapter: :json
    end

    # POST /api/jobs/copy
    # Copies selected jobs to another scope (space, public, private).
    def copy
      copies = CopyService::Copies.new
      Job.accessible_by(@context).where(uid: params[:item_ids]).each do |job|
        copies.push(object: job_copier.copy(job, params[:scope]), source: nil)
      end

      render json: copies.all, root: "jobs", adapter: :json,
             meta: { messages: build_copy_messages(copies) }
    end

    private

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
