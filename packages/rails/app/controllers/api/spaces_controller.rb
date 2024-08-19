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

    # => Replaced by SyncFilesStateOperation, remove when proven to work reliably
    # before_action :sync_files, only: %i(files)

    def https_apps_client
      DIContainer.resolve("https_apps_client")
    end

    # POST /api/spaces/:id/accept
    # Activates a space.
    def accept
      https_apps_client.accept_space(@space.id)
      space = Space.undeleted.find(params[:id])
      # Refactor this email action to node-api as well. (No template in node yet)
      send_emails(space) if space.accepted?
      render json: space, adapter: :json
    end

    # POST /api/spaces
    # Creates a new space.
    def create

      if ["groups", "private_type", "administrator", "government"].include?(create_space_params[:spaceType])
        create_space_dto = create_space_params
        id = https_apps_client.create_space(create_space_dto)
        space = Space.undeleted.find(id)
      else
        # review space in this branch
        space_params = create_space_params.transform_keys! { |key| key.to_s.underscore.to_sym }
        space_form = SpaceForm.new(space_params.merge(current_user: @context.user))

        unless space_form.valid?
          # TODO: This format of errors is used to fit the client code.
          render json: { errors: [space_form.errors.full_messages.join(", ")] },
                 status: :unprocessable_entity
          return
        end

        space = space_form.persist!(api, current_user)

        space.tag_list.push("Protected") if create_space_params[:protected]

        space.tag_list.push("FDA-restricted") if create_space_params[:restrictedReviewer]

        space.save unless space.tag_list.empty?
      end

      render json: space, adapter: :json
    end

    # GET /api/spaces/editable_spaces
    # Returns editable spaces list. Used only for Copy to space dropdown for now.
    def editable_spaces
      spaces = Space.editable_by(@context).order(:name, :space_type).map do |space|
        {
          scope: space.uid,
          name: space.name,
          type: space.space_type,
          title: space.title,
          protected: space.protected,
          restricted_reviewer: space.restricted_reviewer,
        }
      end

      render json: spaces
    end

    # GET /api/spaces
    # Fetches spaces list.
    def index
      allowed_orderings = %w(created_at name state space_type updated_at).freeze

      order = order_query(params[:order_by], params[:order_dir], allowed_orderings)
      filter_tags = params.dig(:filters, :tags)
      order = { created_at: :desc } if order.empty?

      spaces = SpaceService::SpacesFilter.
        call(@context.user, unsafe_params[:filters]).
        includes(:taggings).
        search_by_tags(filter_tags).
        order(order).page(page_from_params).per(page_size)

      page_dict = pagination_dict(spaces)
      page_meta = pagination_meta(spaces.count(:all))

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

      if params.key?(:protected) && params[:protected] != space[:protected]
        raise ApiError, "Parameter protected cannot be changed!"
      end

      space_params = update_space_params.transform_keys! { |key| key.to_s.underscore.to_sym }

      space_edit_params = space_params.merge(
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

      # preload entities needed for serialization
      members = members.includes(:user, :spaces)

      render json: members, adapter: :json
    end

    def cli_members
      response = https_apps_client.cli_space_members(params[:id])
      render json: response
    end

    def cli_discussions
      response = https_apps_client.cli_space_discussions(params[:id])
      render json: response
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

    def fix_guest_permissions
      response = https_apps_client.fix_guest_permissions(params[:id])
      render json: response
    rescue StandardError => e
      raise ApiError, e.message
    end

    # used by CLI by list-spaces command - listing available to user without any excess data
    # allows to use flags like locked or unactivated to list those spaces.
    def cli
      spaces = SpaceService::SpacesFilter.call_for_cli(@context.user, params)
      render json: spaces, :root => false, each_serializer: CliSpaceSerializer
    end

    # GET /api/spaces/:id/selectable_spaces
    # gets all selectable spaces for given space
    # @return spaces [Space] Array of Space objects that can be selected for job
    def selectable_spaces
      spaces = https_apps_client.selectable_spaces(params[:id])
      render json: spaces
    rescue HttpsAppsClient::Error => e
      response[:errors] << e.message
    end

    # POST /api/spaces/:id/report
    def create_report
      response = https_apps_client.create_space_report(params[:id], params[:format], params[:options])
      render json: response, adapter: :json
    rescue Net::HTTPClientException => e
      render status: e.response.code, json: e.response.body
    end

    # GET /api/spaces/:id/report
    def report
      response = https_apps_client.get_space_reports(params[:id])

      if response.blank?
        render(plain: "[]", content_type: "application/json")
      else
        render json: response, root: true, adapter: :json
      end
    end

    # DELETE /api/spaces/report
    def delete_reports
      ids = Rack::Utils.parse_query(request.query_string).fetch("id", [])
      response = https_apps_client.delete_space_reports(ids)

      if response.blank?
        render(plain: "[]", content_type: "application/json")
      else
        render json: response, adapter: :json
      end
    end

    private

    # Sends space activatio email to leads.
    def send_emails(space)
      space.leads.find_each do |lead|
        NotificationsMailer.space_activated_email(space, lead).deliver_later!
      end
    end

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

    def copy_service
      @copy_service ||= CopyService.new(api: api, user: current_user)
    end

    # Checks if items are accessible by a user.
    # @raise [ApiError] If any item isn't accessible by a user.
    def find_items
      @items = params[:uids].uniq.map { |uid| item_from_uid(uid) }

      return if @items.all? { |item| item.accessible_by?(@context) }

      raise ApiError, "Unaccessible items are detected"
    end

    def api
      @api ||= DNAnexusAPI.new(RequestContext.instance.token)
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
      params.require(:space).permit(:name, :description, :cts, :spaceType, :currentUser,
                                    :hostLeadDxuser, :guestLeadDxuser, :sponsorLeadDxuser, :protected)
    end

    def create_space_params
      params.require(:space).permit(:name, :description, :hostLeadDxuser, :guestLeadDxuser,
                                    :spaceType, :cts, :sponsorOrgHandle, :sourceSpaceId,
                                    :sponsorLeadDxuser, :protected, :restrictedReviewer, :restrictedDiscussions)
    end
  end

  # rubocop:enable Metrics/ClassLength
end
