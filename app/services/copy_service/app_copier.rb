class CopyService
  class AppCopier
    def initialize(api:, user:, file_copier: nil)
      @api = api
      @user = user
      @file_copier = file_copier || FileCopier.new(api: api, user: user)
    end

    # Creates a copy of an app in another scope.
    # @param app [App] A source app.
    # @param scope [String] A destination scope.
    # return [CopyService::Copies] Object that includes a source and a new app.
    def copy(app, scope)
      ActiveRecord::Base.transaction do
        opts = build_opts(app, scope)

        new_app = AppService.create_app(user, api, opts)

        authorize_users(new_app, scope)

        new_app
      end
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

      file_copier.copy(app.assets, scope, nil, true).all
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
