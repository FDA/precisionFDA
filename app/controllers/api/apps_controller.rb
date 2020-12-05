module Api
  # Home API controller.
  # rubocop:disable Metrics/ClassLength
  class AppsController < ApiController
    include SpaceConcern
    include Paginationable
    include Sortable
    include ErrorProcessable

    before_action :validate_app, only: :create
    before_action :can_copy_to_scope?, only: %i(copy)

    # GET /api/apps
    # A common Apps fetch method for space and home pages, depends upon @params[:space_id].
    # @param space_id [Integer] Space id for apps fetch. When it is nil, then fetching for
    #   all apps, editable by current user.
    # @param order_by, order_dir [String] Params for ordering.
    # @return apps [App] Array of Apps objects.
    def index
      if params[:space_id]
        find_user_space
        allowed_orderings = %w(created_at).freeze
        order = order_query(params[:order_by], params[:order_dir], allowed_orderings)

        apps = @space.latest_revision_apps.order(order)

        render json: apps, meta: apps_meta, adapter: :json
      else
        apps = AppSeries.editable_by(@context).
          eager_load(latest_revision_app: [user: :org], latest_version_app: [user: :org]).
          order(created_at: :desc).
          map { |series| series.latest_accessible(@context) }.compact

        render json: apps, adapter: :json
      end
    end

    # TODO: this route needs to be refactored.
    # TODO: change old UI to handle json-response!
    # Copies apps to another scope.
    #   HTML-format response is used only for copying a single app to a space from App Page.
    def copy
      new_apps = @apps.map { |app| copy_service.copy(app, params[:scope]).first }

      respond_to do |format|
        format.html do
          redirect_to pathify(new_apps.first),
                      success: copy_success_message
        end
        format.json do
          render json: new_apps, root: "apps", adapter: :json,
                 meta: {
                   messages: [{ type: "success", message: copy_success_message }],
                 }
        end
      end
    rescue DXClient::Errors::ChargesMismatchError => e
      respond_to do |format|
        format.html { redirect_back(fallback_location: @apps.first, flash: { error: e.message }) }
        format.json { raise ApiError, e.message }
      end
    rescue StandardError
      respond_to do |format|
        format.html do
          redirect_back(fallback_location: @apps.first, flash: { error: I18n.t("error_default") })
        end
        format.json { raise ApiError, I18n.t("error_default") }
      end
    end

    # Inputs
    #
    # name, title, readme, input_spec, output_spec, internet_access,
    # instance_type, ordered_assets, packages, code, is_new
    #
    # Outputs
    #
    # id (string, only on success): the id of the created app, if success
    # failure (string, only on failure): a message that can be shown to the user due to failure
    def create
      app = create_app(unsafe_params)

      render json: { id: app.uid }
    rescue DXClient::Errors::ChargesMismatchError => e
      render json: { error: { message: e.message } }, status: :unprocessable_entity
    rescue StandardError => e
      logger.error([e.message, e.backtrace.join("\n")].join("\n"))
      render json: { error: { message: I18n.t("error_default") } }, status: :unprocessable_entity
    end

    def import
      if presenter.valid?
        app, asset = nil

        ActiveRecord::Base.transaction do
          asset = DockerImporter.import(
            context: @context,
            attached_image: unsafe_params[:attached_image],
            docker_image: presenter.docker_image,
          )

          presenter.asset = asset

          opts = unsafe_params[:format] == "wdl" ? presenter.build : App::CwlParser.parse(presenter)

          app = create_app(opts)
        end

        render json: { id: app.uid, asset_uid: asset.try(:uid) }
      else
        render json: { errors: presenter.errors.full_messages }, status: :unprocessable_entity
      end
    rescue Psych::SyntaxError
      render json: { errors: ["CWL has incorrect format"] }, status: :unprocessable_entity
    rescue DXClient::Errors::ChargesMismatchError => e
      render json: { errors: [e.message] }, status: :unprocessable_entity
    rescue StandardError => e
      logger.error e.message
      logger.error e.backtrace.join("\n")
      render json: { errors: [I18n.t("error_default")] }, status: :unprocessable_entity
    end

    # Inputs
    #
    # page (integer, optional): current page number (1 by default)
    # scope (string, optional): app scope (public or private, both by default)
    # query (string, optional): search term
    #
    # Outputs
    #
    # json (array): accessible app revisions
    #
    def accessible_apps # rubocop:disable Metrics/MethodLength
      page = params[:page].to_i > 0 ? params[:page] : 1
      scope = %w(public private).include?(params[:scope]) ? params[:scope] : %w(public private)
      query = params[:query].presence

      app_series = AppSeries.includes(:latest_revision_app)
        .accessible_by(@context)
        .where(scope: scope)
        .page(page)

      if query
        app_series = app_series.eager_load(:tags)
          .where("app_series.name REGEXP ? OR tags.name  REGEXP ?", query, query)
      end

      apps = app_series.map do |app_serie|
        revisions = app_serie.accessible_revisions(@context).map do |app|
          {
            revision: app.revision,
            id: app.id,
            uid: app.uid,
            title: app.title,
            version: app.version,
          }
        end

        latest_revision_app = app_serie.latest_revision_app

        {
          id: latest_revision_app.id,
          name: latest_revision_app.name,
          scope: latest_revision_app.scope,
          spec: latest_revision_app.spec,
          revisions: revisions,
        }
      end

      render json: apps
    end

    # Add Rdoc
    def featured
      org = Org.featured
      apps = []
      if org
        apps = AppSeries.
          accessible_by_public.
          includes(:user, :taggings).
          where(users: { org_id: org.id }).
          order(created_at: :desc)
      end

      render json: apps
    end

    # Add Rdoc
    def everybody
      apps = AppSeries.
        accessible_by_public.
        includes(:latest_version_app, :taggings).
        order(created_at: :desc)

      render json: apps
    end

    private

    # Add Rdoc
    def apps_meta
      { links: {} }.tap do |meta|
        # copy to space link
        meta[:links][:copy] = copy_api_apps_path if @space.editable_by?(current_user)
        # copy to private area link
        meta[:links][:copy_private] = copy_api_apps_path
      end
    end

    def create_app(opts)
      AppService.create_app(current_user, @context.api, opts)
    end

    def presenter
      @presenter ||= begin
        klass = unsafe_params[:format] == "wdl" ? App::WdlPresenter : CwlPresenter
        klass.new(unsafe_params[:file])
      end
    end

    def validate_app
      release = unsafe_params[:release]
      fail "Unacceptable release" unless release.in?(UBUNTU_RELEASES)

      name = unsafe_params[:name]

      if !name.is_a?(String) || name.empty?
        fail "The app 'name' must be a nonempty string."
      end

      unless name =~ /^[a-zA-Z0-9._-]+$/
        fail "The app 'name' can only contain the characters A-Z, a-z, 0-9, " \
             "'.' (period), '_' (underscore) and '-' (dash)."
      end

      title = unsafe_params[:title]

      if !title.is_a?(String) || title.empty?
        fail "The app 'title' must be a nonempty string."
      end

      readme = unsafe_params[:readme]

      unless readme.is_a?(String)
        fail "The app 'Readme' must be a string."
      end

      internet_access = unsafe_params[:internet_access]

      unless [true, false].include?(internet_access)
        fail "The app 'Internet Access' must be a boolean, true or false."
      end

      instance_type = unsafe_params[:instance_type]

      unless Job::INSTANCE_TYPES.include?(instance_type)
        fail "The app 'instance type' must be one of: " \
             "#{Job::INSTANCE_TYPES.keys.join(', ')}."
      end

      packages = unsafe_params[:packages] || []

      if !packages.is_a?(Array) || !packages.all? { |a| a.is_a?(String) }
        fail "The app 'packages' must be an array of package names (strings)."
      end

      packages.sort!.uniq!

      packages.each do |package|
        unless UBUNTU_PACKAGES[release].bsearch { |p| package <=> p }
          fail "The package '#{package}' is not a valid Ubuntu package."
        end
      end

      unsafe_params[:packages] = packages

      code = unsafe_params[:code]

      fail "The app 'code' must be a string." unless code.is_a?(String)

      ordered_assets = unsafe_params[:ordered_assets] || []

      if !ordered_assets.is_a?(Array) ||
         !ordered_assets.all? { |a| a.is_a?(String) }
        fail "The app 'assets' must be an array of asset uids (strings)."
      end

      missed_assets = ordered_assets.group_by do |asset_uid|
        Asset.closed.accessible_by(@context).where(uid: asset_uid).exists?
      end[false]

      unless missed_assets.blank?
        fail "The app assets with uids '#{missed_assets.join(', ')}' do " \
             "not exist or are not accessible by you."
      end

      validate_app_input_spec
      validate_app_output_spec
    end

    def validate_app_input_spec
      input_spec = unsafe_params[:input_spec] || []

      if !input_spec.is_a?(Array) || !input_spec.all? { |s| s.is_a?(Hash) }
        fail "The app 'input spec' must be an array of hashes."
      end

      inputs_seen = Set.new

      unsafe_params[:input_spec] = input_spec.each_with_index.map do |spec, i|
        i_name = spec["name"]

        if !i_name.is_a?(String) || i_name.empty?
          fail "The #{(i + 1).ordinalize} input is missing a name."
        end

        unless i_name =~ /^[a-zA-Z_][0-9a-zA-Z_]*$/
          fail "The input name '#{i_name}' contains invalid characters. " \
               "It must start with a-z, A-Z or '_', " \
               "and continue with a-z, A-Z, '_' or 0-9."
        end

        if inputs_seen.include?(i_name)
          fail "Duplicate definitions for the input named '#{i_name}'."
        end

        inputs_seen << i_name

        i_class = spec["class"]

        if !i_class.is_a?(String) || i_class.empty?
          fail "The input named '#{i_name}' is missing a type."
        end

        unless App::VALID_IO_CLASSES.include?(i_class)
          fail "The input named '#{i_name}' contains an invalid type. " \
               "Valid types are: #{App::VALID_IO_CLASSES.join(', ')}."
        end

        i_optional = spec["optional"]

        unless [true, false].include?(i_optional)
          fail "The input named '#{i_name}' is missing " \
               "the 'optional' designation."
        end

        i_label = spec["label"]

        unless i_label.is_a?(String)
          fail "The input named '#{i_name}' is missing a label."
        end

        i_help = spec["help"]

        unless i_help.is_a?(String)
          fail "The input named '#{i_name}' is missing help text."
        end

        i_default = spec["default"]

        if i_default
          unless compatible(i_default, i_class)
            fail "The default value provided for the input named " \
                 "'#{i_name}' is not of the right type."
          end

          # Fix for JSON ambiguity of float/int for ints.
          i_default = i_default.to_i if i_class == "int"
        end

        i_choices = spec["choices"].try(:uniq).presence

        if i_choices.present?
          unless i_choices.is_a?(Array)
            fail "The 'choices' (possible values) provided for the input " \
                 "named '#{i_name}' is not an array."
          end

          unless i_choices.all? { |choice| compatible(choice, i_class) }
            fail "The 'choices' (possible values) provided for the input " \
                 "named '#{i_name}' is incompatible with the input type."
          end

          unless %w(string int float).include?(i_class)
            fail "You cannot provide 'choices' (possible values) for " \
                 "the input named '#{i_name}' because it's not of type " \
                 "'string' or 'int' or 'float'."
          end
        end

        i_patterns = spec["patterns"].try(:uniq)

        if i_patterns.present?
          unless i_patterns.is_a?(Array)
            fail "The filename patterns provided for the input named " \
                 "'#{i_name}' is not an array"
          end

          if i_class != "file"
            fail "You cannot provide filename patterns for " \
                 "the non-file input named '#{i_name}'."
          end

          if i_patterns.any?(&:empty?)
            fail "The filename patterns provided for the input named " \
                 "'#{i_name}' is not an array of nonempty strings."
          end
        end

        ret = {
          "name": i_name,
          "class": i_class,
          "optional": i_optional,
          "label": i_label,
          "help": i_help,
        }

        ret["default"] = i_default if !i_default.nil?
        ret["choices"] = i_choices if i_choices
        ret["patterns"] = i_patterns if i_patterns

        ret
      end
    end

    def validate_app_output_spec
      output_spec = unsafe_params[:output_spec] || []

      if !output_spec.is_a?(Array) || !output_spec.all? { |s| s.is_a?(Hash) }
        fail "The app 'output spec' must be an array of hashes."
      end

      outputs_seen = Set.new

      unsafe_params[:output_spec] = output_spec.each_with_index.map do |spec, i|
        i_name = spec["name"]

        if !i_name.is_a?(String) || i_name.empty?
          fail "The #{(i + 1).ordinalize} output is missing a name."
        end

        unless i_name =~ /^[a-zA-Z_][0-9a-zA-Z_]*$/
          fail "The output name '#{i_name}' contains invalid characters. " \
               "It must start with a-z, A-Z or '_', " \
               "and continue with a-z, A-Z, '_' or 0-9."
        end

        if outputs_seen.include?(i_name)
          fail "Duplicate definitions for the output named '#{i_name}'."
        end

        outputs_seen << i_name

        i_class = spec["class"]

        if !i_class.is_a?(String) || i_class.empty?
          fail "The output named '#{i_name}' is missing a type."
        end

        unless App::VALID_IO_CLASSES.include?(i_class)
          fail "The output named '#{i_name}' contains an invalid type. " \
               "Valid types are: #{App::VALID_IO_CLASSES.join(', ')}."
        end

        i_optional = spec["optional"]

        unless [true, false].include?(i_optional)
          fail "The output named '#{i_name}' is missing the 'optional'" \
               "designation."
        end

        i_label = spec["label"]

        unless i_label.is_a?(String)
          fail "The output named '#{i_name}' is missing a label."
        end

        i_help = spec["help"]

        unless i_help.is_a?(String)
          fail "The output named '#{i_name}' is missing help text."
        end

        i_patterns = spec["patterns"].try(:uniq)

        if i_patterns.present?
          unless i_patterns.is_a?(Array)
            fail "The filename patterns provided for the output named " \
                 "'#{i_name}' is not an array"
          end

          if i_class != "file"
            fail "You cannot provide filename patterns for " \
                 "the non-file output named '#{i_name}'."
          end

          if i_patterns.any?(&:empty?)
            fail "The filename patterns provided for the output named " \
                 "'#{i_name}' is not an array of nonempty strings."
          end
        end

        ret = {
          "name": i_name,
          "class": i_class,
          "optional": i_optional,
          "label": i_label,
          "help": i_help,
        }

        ret["patterns"] = i_patterns if i_patterns

        ret
      end
    end

    def compatible(value, klass)
      if klass == "file"
        value.is_a?(String)
      elsif klass == "int"
        value.is_a?(Numeric) && (value.to_i == value)
      elsif klass == "float"
        value.is_a?(Numeric)
      elsif klass == "boolean"
        [true, false].include?(value)
      elsif klass == "string"
        value.is_a?(String)
      end
    end

    def copy_service
      @copy_service ||= CopyService.new(api: @context.api, user: current_user)
    end

    def can_copy_to_scope?
      scope = params[:scope]

      is_pub_or_priv_scope = [Scopes::SCOPE_PUBLIC, Scopes::SCOPE_PRIVATE].include?(scope)

      if !is_pub_or_priv_scope && !Space.valid_scope?(scope)
        raise ApiError, "Scope parameter is incorrect (can be public, private or space-xxx)"
      end

      @apps = App.accessible_by(@context).where(id: params[:item_ids])

      raise ApiError, "You have no permissions to copy the selected apps!" unless @apps.exists?

      return if is_pub_or_priv_scope

      space = Space.from_scope(scope)

      return if space.editable_by?(current_user)

      raise ApiError, "You have no permissions to copy apps to the scope '#{scope}'"
    end

    # Build the copy success message.
    # @return [String] The message.
    def copy_success_message
      case params[:scope]
      when Scopes::SCOPE_PRIVATE
        I18n.t("api.apps.copy.messages.publish_to_private")
      when Scopes::SCOPE_PUBLIC
        I18n.t("api.apps.copy.messages.publish")
      else
        I18n.t("api.apps.copy.messages.publish_to_space")
      end
    end
  end
  # rubocop:enable Metrics/ClassLength
end
