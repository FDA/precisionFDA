class CopyService
  class AppCopier
    def initialize(api:, user:, file_copier: nil)
      @api = api
      @user = user
      @file_copier = file_copier || CopyService::NodeApiCopier.new(api: api, user: user)
    end

    # Creates a copy of an app in another scope.
    # @param app [App] A source app.
    # @param scope [String] A destination scope.
    # @param properties [Hash] Properties to create a new app with.
    # return [CopyService::Copies] Object that includes a source and a new app.
    def copy(app, scope, properties = {})
      # NOTE: build_opts triggers asset/default-input-file copies through the
      # Node API (HTTP) and reads the copied rows back. It must NOT run inside
      # a database transaction - REPEATABLE READ snapshot isolation would hide
      # the rows committed by the Node API on its own connection, silently
      # creating the app without assets/default input files.
      #
      # Node-side copies cannot be rolled back from Rails; on mid-copy failure
      # the destination keeps already-copied nodes. Retrying converges: the
      # Node API dedupes copies by dxid + destination project (copied: false).
      opts = build_opts(app, scope)

      opts[:createAppSeries] = properties["createAppSeries"] if properties.key?("createAppSeries")
      opts[:createAppRevision] = properties["createAppRevision"] if properties.key?("createAppRevision")

      new_app = AppService.create_app(user, api, opts)
      authorize_users(new_app, scope)
      ActiveRecord::Base.transaction do
        user.tag(new_app.app_series, with: app.app_series.tags, on: :tags)
      end
      SpaceEventService.call(Space.from_scope(new_app.scope).id, user.id, nil, new_app, :app_added) if new_app.in_space?
      new_app
    end

    private

    attr_reader :api, :user, :file_copier

    # Adds authorized users and developers to an app.
    # @param app [App] A new app.
    # @param scope [String] A destination scope.
    def authorize_users(app, scope)
      return if scope == Scopes::SCOPE_PRIVATE

      authorized_users_for_scope = AppSeries.authorized_users_for_scope(scope)

      # TODO: do we need to authorize users if we copy a public app?
      #   It should be already authorized for anyone.
      # TODO: do we need to add space VIEWERS as authorized? I don't think so.
      api.app_add_authorized_users(
        app.dxid,
        authorized_users_for_scope,
      )

      # We need to add members of a new space as app developers to allow them to copy this app
      #   to any accessible scope in future.
      # TODO: do we need to add space VIEWERS as developers? I don't think so.
      api.app_add_developers(
        app.dxid,
        authorized_users_for_scope,
      )
    end

    # Builds options for passing to App creation service.
    # @param app [App] A source app.
    # @param scope [String] A destination scope.
    # @return [Hash] Returns options for a new app.
    def build_opts(app, scope)
      {}.tap do |opts|
        opts[:scope] = scope
        opts[:name] = app.name
        opts[:title] = app.title
        opts[:entity_type] = app.entity_type
        opts[:release] = app.release
        opts[:output_spec] = app.output_spec
        opts[:code] = app.code
        opts[:instance_type] = app.instance_type
        opts[:packages] = app.packages
        opts[:internet_access] = app.internet_access
        opts[:readme] = app.readme
        opts[:ordered_assets] = build_assets(app, scope)
        opts[:input_spec] = build_input_spec(app, scope)
      end
    end

    # Builds and creates assets for a new app.
    # @param app [App] A source app.
    # @param scope [String] A destination scope.
    # @return [Array<String>] Asset UIDs.
    def build_assets(app, scope)
      assets = copy_assets(app, scope)

      assets.map(&:uid)
    end

    # Builds input spec for a new app. Copies default input files from a source app.
    # @param app [App] A source app.
    # @param scope [String] A destination scope.
    # @return [Array<Hash>] Input spec for a new app.
    def build_input_spec(app, scope)
      files_copies = copy_default_input_files(app, scope)

      input_spec = app.input_spec

      files_copies.each do |object, source|
        input_spec = input_spec.map do |spec|
          spec[:default] = object.uid if spec[:class] == "file" && spec[:default] == source.uid
          spec
        end
      end

      input_spec
    end

    # Copies assets from a source app.
    # @param app [App] A source app.
    # @param scope [String] A destination scope.
    # return [Array<Asset>] Copied assets.
    def copy_assets(app, scope)
      return [] unless app.assets.exists?

      # Asset parent semantics (PFDA-3325: parent_type must stay "Asset") are
      # handled by the Node API based on the node's STI type.
      copies = file_copier.copy(app.assets, scope)
      copies.each do |target, source, copied|
        next unless copied && target.is_a?(Asset) && source.is_a?(Asset)

        target.archive_entries = source.archive_entries.map(&:dup)
      end

      copies.all
    end

    # Copies default input files from a source app.
    # @param app [App] A source app.
    # @param scope [String] A destination scope.
    # return [CopyService::Copies] Object that includes source and new files.
    def copy_default_input_files(app, scope)
      uids = app.default_input_files

      return [] if uids.empty?

      files = UserFile.where(uid: uids)

      file_copier.copy(files, scope)
    end
  end
end
