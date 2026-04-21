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
      # TODO template is already in node, but
      # refactoring would require refactoring SpaceAcceptOperation PFDA-5864
      send_emails(space) if space.accepted?
      render json: space, adapter: :json
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

    # Copies apps or workflows from any accessible user scope to the current space.
    # File copying is handled directly by the Node API via /api/v2/nodes/copy.
    def add_data
      head(:forbidden) && return unless @space.editable_by?(current_user)

      grouped = @items.group_by(&:klass)
      _, _, apps, workflows = grouped.values_at("file", "asset", "app", "workflow")

      workflows&.each { |workflow| workflow_copy_service.copy(workflow, @space.scope, params[:properties]) }
      apps&.each { |app| app_copy_service.copy(app, @space.scope, params[:properties]) }

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

    # Sends space activation email to leads.
    def send_emails(space)
      space.leads.find_each do |lead|
        https_apps_client.email_send(NotificationPreference.email_types[:space_activated], { id: lead.id }) # id is membership id
      end
    end

    def app_copy_service
      @app_copy_service ||= CopyService::AppCopier.new(api:, user: current_user)
    end

    def workflow_copy_service
      @workflow_copy_service ||= CopyService::WorkflowCopier.new(api:, user: current_user)
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

      return if @space.accessible_by_user?(current_user)

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
