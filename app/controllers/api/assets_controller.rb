module Api
  # Assets API controller.
  # rubocop:disable Metrics/ClassLength
  class AssetsController < ApiController
    include SpaceConcern
    include CommonConcern
    include AssetsConcern
    include Paginationable
    include Sortable
    include Scopes

    before_action :sync_assets, only: %i(index)

    DOWNLOAD_ACTION = "download".freeze
    PUBLISH_ACTION = "publish".freeze
    DELETE_ACTION = "delete".freeze
    COPY_ACTION = "copy".freeze
    COPY_TO_PRIVATE_ACTION = "copy_to_private".freeze

    ORDER_FIELDS = {
      "created_at" => "created_at",
      "name" => "name",
      "size" => "file_size",
      "state" => "state",
      "username" => %w(users.first_name users.last_name),
    }.freeze

    PAGE_SIZE = Paginationable::PAGE_SIZE

    # GET /api/assets
    # api_assets_path
    # Assets fetch method: all user 'private' assets, editable by a current user.
    # @param order_by, order_dir [String] Params for ordering.
    # @return assets [Asset] Array of Asset objects if they exist OR assets: [].
    def index
      assets = Asset.unscoped.
        editable_by(@context).
        accessible_by_private.
        eager_load(user: :org).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags)).
        order(order_from_params).
        page(page_from_params).per(PAGE_SIZE)
      assets = FileService::FilesFilter.call(assets, params[:filters])

      render_assets_list assets
    end

    # GET /api/jobs/featured
    # A fetch method for jobs, accessible by public and with admin taggings.
    # @param created_at [String] Param for ordering.
    # @return jobs [Job] Array of Job objects if they exist OR jobs: [].
    def featured
      assets = Asset.featured.
        accessible_by_public.
        eager_load(user: :org).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags)).
        order(order_from_params).
        page(page_from_params).per(PAGE_SIZE)
      assets = FileService::FilesFilter.call(assets, params[:filters])

      render_assets_list assets
    end

    # GET /api/assets/everybody
    # A fetch method for assets, accessible by public.
    # Fetches all user 'public' assets.
    # @param order_by, order_dir [String] Params for ordering.
    # @return assets [Asset] Array of Asset objects if they exist OR assets: [].
    def everybody
      assets = Asset.unscoped.
        accessible_by_public.
        eager_load(user: :org).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags)).
        order(order_from_params).
        page(page_from_params).per(PAGE_SIZE)
      assets = FileService::FilesFilter.call(assets, params[:filters])

      render_assets_list assets
    end

    # GET /api/assets/spaces
    # A fetch method for assets, accessible by user and of 'space' scope.
    # @param created_at [String] Param for ordering.
    # @return assets [UserFile] Array of assets objects,
    #   which scope is not 'private' or 'public', i.e.
    #   jobs scope is one of 'space-...', if they exist OR jobs: [].
    def spaces
      assets = Asset.unscoped.
        editable_by(@context).where.not(scope: [SCOPE_PUBLIC, SCOPE_PRIVATE]).
        eager_load(user: :org).
        includes(:taggings).
        search_by_tags(params.dig(:filters, :tags)).
        order(order_from_params).
        page(page_from_params).per(PAGE_SIZE)
      assets = FileService::FilesFilter.call(assets, params[:filters])

      render_assets_list assets
    end

    # A common method for assets list json rendering.
    # @param assets [Array] Array of Asset objects.
    # @return render assets as json with meta
    def render_assets_list(assets)
      page_dict = pagination_dict(assets)
      render json: assets, root: "assets", adapter: :json,
             meta: assets_meta.
               merge(count(page_dict[:total_count])).
               merge({ pagination: page_dict })
    end

    # GET /api/asset/:id  api_asset_path
    # A fetch method for asset by file :id, accessible by user.
    # @param id [Integer] Param for asset fetch.
    # @return job Asset object with arrays of assosiated objects:
    #   notes, answers, comments, discussions, comparisons.
    # rubocop:disable Metrics/MethodLength
    def show
      find_asset
      sync_assets
      load_relations(@asset)
      comments_data(@asset)
      load_licenses(@asset)

      render json:
               @asset, adapter: :json,
             meta: {
               user_licenses: @licenses,
               object_license: @license,
               notes: @notes,
               answers: @answers,
               discussions: @discussions,
               comments: @comments,
               links: meta_links(@asset),
             }
    end

    # PUT /api/assets/:id
    # Updates an assets.
    def update
      find_asset
      @asset.update!(asset_params)

      render json: @asset, adapter: :json
    end

    # DELETE: /api/assets/:id - Delete single asset
    def destroy
      @file = Asset.find_by(uid: params[:id])
      unless @file.editable_by?(@context)
        type = :warning
        text = "You have no permission to deleted this Asset \"#{@file.prefix}\""
        path = api_assets_path

        render json: { path: path, message: { type: type, text: text } }, adapter: :json
        return
      end

      UserFile.transaction do
        @file.reload

        if @file.license.present? && !@file.apps.empty?
          type = :error
          text = "This asset contains a license, and has been included in one or more apps. " \
                 "Deleting it would render the license inaccessible to these apps,  " \
                 "breaking reproducibility. You can either first remove the license " \
                 "(allowing these existing apps to run without requiring a license) " \
                 "or contact the precisionFDA team to discuss other options."
          path = api_asset_path(@file)

          render json: { path: path, message: { type: type, text: text } }, adapter: :json
          return
        end
        @file.destroy
      end

      DNAnexusAPI.new(@context.token).call(@file.project, "removeObjects", objects: [@file.dxid])

      type = :success
      text = "Asset \"#{@file.prefix}\" has been successfully deleted"
      path = api_assets_path

      render json: { path: path, message: { type: type, text: text } }, adapter: :json
    end

    # POST
    def rename
      find_asset
      unless @asset.editable_by?(@context)
        path = api_assets_path
        type = :error
        text = "You are not allowed to rename this asset"

        render json: { path: path, message: { type: type, text: text } }, adapter: :json
        return
      end

      title = params[:title]
      if title.is_a?(String) && title != ""
        name = title + @asset.suffix
        description = params[:description] || @asset.description
        if @asset.rename(name, description)
          @asset.reload
          path = api_assets_path
          type = :success
          text = "Asset renamed to \"#{@asset.name}\""
        else
          path = api_assets_path
          type = :error
          text = "Asset \"#{@asset.name}\" could not be renamed"
        end
      else
        path = api_assets_path
        type = :error
        text = "The new name is not a valid strin"
      end

      render json: { path: path, message: { type: type, text: text } }, adapter: :json
    end

    private

    # Refresh state of assets, if needed
    def sync_assets
      User.sync_assets!(@context)
    end

    def asset_params
      params.require(:asset).permit(:description, :title, :id)
    end

    def assets_meta
      meta = {}

      meta[:links] = {}.tap do |links|
        links[:copy_private] = copy_api_files_path

        if @space&.editable_by?(current_user)
          links[:publish] = publish_files_api_space_files_path(@space)
          links[:move] = move_api_space_files_path(@space)
          links[:remove] = remove_api_space_files_path(@space)
          links[:copy] = copy_api_files_path
          # links[:create_folder] = create_folder_api_space_files_path(@space)
        end
      end

      # if params[:folder_id]
      #   folder = Folder.find(params[:folder_id])
      #   meta[:path] = build_path(folder, []).reverse
      # end

      meta
    end

    def can_copy_to_scope?
      scope = params[:scope]

      return if [Scopes::SCOPE_PUBLIC, Scopes::SCOPE_PRIVATE].include?(params[:scope])

      space = Space.from_scope(scope) if Space.valid_scope?(scope)

      raise ApiError, "Scope parameter is incorrect (can be public or space-x)" unless space

      return if space.editable_by?(current_user)

      raise ApiError, "You have no permissions to copy jobs to the scope '#{scope}'"
    end
    # rubocop:enable Metrics/MethodLength
  end
  # rubocop:enable Metrics/ClassLength
end
