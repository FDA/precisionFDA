module Api
  # Spaces API controller.
  # rubocop:disable Metrics/ClassLength
  class SpacesController < ApiController
    include Paginationable
    include Sortable

    before_action :find_items, only: :add_data

    before_action :find_space,
                  only: %i(
                    accept
                    add_data
                    apps
                    files
                    jobs
                    members
                    show
                    tags
                    workflows
                  )

    # POST /api/spaces/:id/accept
    # Activates a space.
    def accept
      membership = @space.space_memberships.find_by(user: current_user)

      if SpaceMembershipPolicy.can_accept?(@space, membership)
        SpaceService::Accept.call(api, @space, membership)

        render json: @space, adapter: :json
      else
        head :forbidden
      end
    end

    # POST /api/spaces
    # Creates a new space.
    def create
      space_form = SpaceForm.new(create_space_params)

      unless space_form.valid?
        # TODO: This format of errors is used to fit the client code.
        render json: { errors: [space_form.errors.full_messages.join(", ")] },
               status: :unprocessable_entity

        return
      end

      space = space_form.persist!(api, current_user)

      render json: space, adapter: :json
    end

    # GET /api/spaces/editable_spaces
    # Returns editable spaces list. Used only for Copy to space dropdown for now.
    def editable_spaces
      spaces = Space.editable_by(@context).order(:name, :space_type).map do |space|
        { scope: space.uid, title: space.title }
      end

      render json: spaces
    end

    # GET /api/spaces
    # Fetches spaces list.
    def index
      allowed_orderings = %w(created_at name space_type updated_at).freeze
      page = params[:page].presence || 1

      order = order_query(params[:order_by], params[:order_dir], allowed_orderings)

      spaces = SpaceService::SpacesFilter.
        call(@context.user, unsafe_params[:query]).
        order(order).
        page(page)

      render json: spaces, meta: pagination_dict(spaces).merge(order: order), adapter: :json
    end

    # GET /api/spaces/info
    # Responds with spaces info.
    def info
      render json: { allowed_types: space_types }
    end

    # GET /api/spaces/:id
    # Fetches a space.
    def show
      render json: @space, adapter: :json
    end

    # PUT /api/spaces/:id
    # Updates a space.
    def update
      space = Space.undeleted.find(params[:id])

      head(:forbidden) && return unless space.updatable_by?(current_user)

      space.update!(update_space_params)

      render json: space, adapter: :json
    end

    # GET /api/spaces/:id/apps
    # Fetches space apps.
    def apps
      allowed_orderings = %w(created_at).freeze
      order = order_query(params[:order_by], params[:order_dir], allowed_orderings)

      apps = @space.latest_revision_apps.order(order)

      render json: apps, meta: apps_meta, adapter: :json
    end

    # GET /api/spaces/:id/files
    # Fetches space files.
    def files
      orderings = {
        "name" => "name",
        "type" => "sti_type",
        "created_at" => "created_at",
        "size" => "file_size",
        "state" => "state",
      }

      order = order_query(orderings[params[:order_by]], params[:order_dir], orderings.values)

      folder_id = params[:folder_id]

      nodes = @space.nodes.files_and_folders.where(scoped_parent_folder_id: folder_id).order(order)

      render json: {
        entries: nodes.map { |node| helpers.client_file(node, @space, current_user) },
        meta: files_meta,
      }
    end

    # GET /api/spaces/:id/workflows
    # Fetches space workflows.
    def workflows
      allowed_orderings = %w(created_at).freeze
      order = order_query(params[:order_by], params[:order_dir], allowed_orderings)

      workflows = @space.workflows.order(order)

      render json: workflows, meta: workflows_meta, adapter: :json
    end

    # GET /api/spaces/:id/members
    # Fetches space members, according to filter value.
    def members
      side =
        case params[:side]
        when SpaceMembership::SIDE_HOST, SpaceMembership::SIDE_HOST_ALIAS
          "host"
        when SpaceMembership::SIDE_GUEST, SpaceMembership::SIDE_GUEST_ALIAS
          "guest"
        end

      members = @space.space_memberships
      members = members.where(side: side) if side

      render json: members, adapter: :json
    end

    # POST /api/spaces/:id/tags
    # Updates tags.
    def tags
      @space.tag_list = params[:tags]

      @space.save ? head(:ok) : head(:unprocessable_entity)
    end

    # GET /api/spaces/:id/jobs
    def jobs
      allowed_orderings = %w(created_at).freeze
      order = order_query(params[:order_by], params[:order_dir], allowed_orderings)

      jobs = @space.jobs.order(order)

      User.sync_jobs!(@context, jobs)

      render json: jobs, adapter: :json
    end

    # TODO: split this route to separately handle different objects?
    # Copies files, apps or workflows from any accessible user scope to the current space.
    def add_data
      head(:forbidden) && return unless @space.editable_by?(current_user)

      grouped = @items.group_by(&:klass)

      user_files, assets, apps, workflows = grouped.values_at("file", "asset", "app", "workflow")
      files = Array(user_files) + Array(assets)
      apps ||= []

      copied_files = nil

      if files.present?
        destination_project = UserFile.publication_project!(current_user, @space.scope)

        UserFile.transaction do
          # create initial copies of files with a COPYING state, in order to show them in the UI.
          copied_files = files.map do |file|
            CopyService::FileCopier.copy_record(
              file,
              @space.scope,
              destination_project,
              state: UserFile::STATE_COPYING,
              scoped_parent_folder_id: params[:folder_id],
            )
          end

          FileCopyWorker.perform_async(
            @space.scope,
            files.map(&:id),
            params[:folder_id],
            session_auth_params,
          )
        end
      end

      workflows&.each { |workflow| copy_service.copy(workflow, @space.scope) }
      apps.each { |app| copy_service.copy(app, @space.scope) }

      head :ok
    end

    private

    def copy_service
      @copy_service ||= CopyService.new(api: api, user: current_user)
    end

    # Checks if items are accessible by a user.
    # @raise [ApiError] If any item isn't accessible by a user.
    def find_items
      @items = params[:uids].uniq.map { |uid| item_from_uid(uid) }

      return if @items.all? { |item| item.accessible_by?(@context) }

      raise ApiError, "Unaccessable items are detected"
    end

    def api
      @api ||= DIContainer.resolve("api.user")
    end

    def space_types
      [].tap do |types|
        types << :groups if @context.can_administer_site?
        types << :review if @context.review_space_admin?
      end
    end

    # Finds space by id.
    # @return [Space] A space.
    def find_space
      @space = Space.undeleted.find(params[:id])

      return if @space.accessible_by_user?(current_user)

      raise ApiError, "The space is locked." if @space.visible_by?(current_user) && @space.locked?

      head :forbidden
    end

    def files_meta
      meta = {}

      meta[:links] = {}.tap do |links|
        if @space.editable_by?(current_user)
          links[:publish] = publish_files_api_space_files_path(@space)
          links[:move] = move_api_space_files_path(@space)
          links[:remove] = remove_api_space_files_path(@space)
          links[:copy] = copy_api_files_path
          links[:create_folder] = create_folder_api_space_files_path(@space)
        end
      end

      if params[:folder_id]
        folder = Folder.find(params[:folder_id])
        meta[:path] = build_path(folder, []).reverse
      end

      meta
    end

    def build_path(folder, built)
      built << { id: folder.id, name: folder.name }
      parent = folder.parent_folder
      build_path(parent, built) if parent
      built
    end

    def apps_meta
      { links: {} }.tap do |meta|
        meta[:links][:copy] = copy_api_apps_path if @space.editable_by?(current_user)
      end
    end

    def workflows_meta
      { links: {} }.tap do |meta|
        meta[:links][:copy] = copy_api_workflows_path if @space.editable_by?(current_user)
      end
    end

    def update_space_params
      params.require(:space).permit(:name, :description, :cts)
    end

    def create_space_params
      params.require(:space).permit(:name, :description, :host_lead_dxuser, :guest_lead_dxuser,
                                    :space_type, :cts, :sponsor_org_handle, :source_space_id,
                                    :sponsor_lead_dxuser, :restrict_to_template)
    end
  end
  # rubocop:enable Metrics/ClassLength
end
