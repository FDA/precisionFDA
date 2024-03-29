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

    before_action :sync_files, only: %i(files)

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

      order = order_query(params[:order_by], params[:order_dir], allowed_orderings)

      spaces = SpaceService::SpacesFilter.
        call(@context.user, unsafe_params[:filters]).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags)).
        order(order).page(page_from_params).per(page_size)

      page_dict = pagination_dict(spaces)
      spaces = sort_array_by_fields(spaces)
      page_meta = pagination_meta(spaces.count)

      render json: spaces, root: "spaces", adapter: :json,
             meta: page_meta.merge({ pagination: page_dict })
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
    # @param id [String] - space id in a string form: id: "9-spacename"
    # @param update_space_params [Object] - space params from SpaceEditForm
    def update
      space = Space.undeleted.find(params[:id])

      head(:forbidden) && return unless space.updatable_by?(current_user)

      space_edit_params = update_space_params.merge(
        current_user: current_user,
        space_host_lead: space.host_lead_dxuser,
        source_space_id: space.id,
      )

      space_edit_params = space_edit_params.merge(space_guest_lead: space.guest_lead_dxuser) unless space.exclusive?
      space_update_form = SpaceEditForm.new(space_edit_params)

      if space_update_form.valid?
        space.update!(update_space_naming_params)
        space.confidential_spaces.each { |confidential_space| confidential_space.update!(update_space_naming_params) }
        api = DIContainer.resolve("api.admin")

        space.leads_updates(space_update_form, api)

        render json: space, adapter: :json
      else
        errors = [space_update_form.errors&.full_messages&.join("\n ")]

        render json: { errors: { messages: errors } },
               status: :unprocessable_entity, adapter: :json
      end
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

      Job.sync_jobs!(@context, jobs)

      render json: jobs, adapter: :json
    end

    # TODO: split this route to separately handle different objects?
    # Copies files, apps or workflows from any accessible user scope to the current space.
    def add_data
      head(:forbidden) && return unless @space.editable_by?(current_user)

      grouped = @items.group_by(&:klass)
      user_files, assets, apps, workflows = grouped.values_at("file", "asset", "app", "workflow")
      files = Array(user_files) + Array(assets)
      copy_files_to_space(files)
      workflows&.each { |workflow| copy_service.copy(workflow, @space.scope) }
      apps&.each { |app| copy_service.copy(app, @space.scope) }

      head :ok
    end

    private

    # Copy files to a space using the worker.
    def copy_files_to_space(files)
      return if files.blank?

      prepare_files_to_copy(files)

      FileCopyWorker.perform_async(
        @space.scope,
        files.map(&:id),
        params[:folder_id],
        session_auth_params,
      )
    end

    # Create initial copies of files with a COPYING state, in order to show them in the UI.
    def prepare_files_to_copy(files)
      destination_project = UserFile.publication_project!(current_user, @space.scope)

      UserFile.transaction do
        files.each do |file|
          next if !file.closed? ||
                  file.project == destination_project ||
                  UserFile.exists?(dxid: file.dxid, project: destination_project)

          CopyService::FileCopier.copy_record(
            file,
            @space.scope,
            destination_project,
            state: UserFile::STATE_COPYING,
            scoped_parent_folder_id: params[:folder_id],
          )
        end
      end
    end

    def sync_files
      User.sync_files!(@context)
    end

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
        types << :private_type
        types << :groups if @context.can_administer_site?
        types << :government if @context.gov_user?
        types << :review if @context.review_space_admin?
        types << :administrator if @context.can_administer_site?
      end
    end

    # Finds space by id.
    # @return [Space] A space.
    def find_space
      @space = Space.undeleted.find(params[:id])

      return if @space.accessible_by_user?(current_user) ||
                (current_user.review_space_admin? && @space.review?)

      raise ApiError, "The space is locked." if @space.visible_by?(current_user) && @space.locked?

      head :forbidden
    end

    def files_meta
      meta = {}

      meta[:links] = {}.tap do |links|
        links[:copy_private] = copy_api_files_path

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
        # copy to space link
        meta[:links][:copy] = copy_api_apps_path if @space.editable_by?(current_user)
        # copy to private area link
        meta[:links][:copy_private] = copy_api_apps_path
      end
    end

    def workflows_meta
      { links: {} }.tap do |meta|
        meta[:links][:copy] = copy_api_workflows_path if @space.editable_by?(current_user)
      end
    end

    def update_space_naming_params
      params.require(:space).permit(:name, :description, :cts)
    end

    def update_space_params
      params.require(:space).permit(:name, :description, :cts, :space_type, :current_user,
                                    :host_lead_dxuser, :guest_lead_dxuser, :sponsor_lead_dxuser)
    end

    def create_space_params
      params.require(:space).permit(:name, :description, :host_lead_dxuser, :guest_lead_dxuser,
                                    :space_type, :cts, :sponsor_org_handle, :source_space_id,
                                    :sponsor_lead_dxuser, :restrict_to_template)
    end
  end
  # rubocop:enable Metrics/ClassLength
end
