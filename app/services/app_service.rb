# Responsible for creating new apps and applets.
class AppService
  class << self
    # Creates new app on the platform and stores it in the database.
    # @param user [User] Who creates an app.
    # @param options [Hash] Options to create app with.
    def create_app(user, api, options)
      new(user, api).create_app(options)
    end
  end

  # Constructor.
  # @param user [User] Who creates an app.
  # @param api [DNAnexusAPI] API client.
  def initialize(user, api)
    @user = user
    @api = api
  end

  # Creates new app on the platform and stores it in database.
  # @param opts [Hash] Options to create app with.
  # @return [App] Created app.
  def create_app(opts)
    app = nil
    scope = opts[:scope] || Scopes::SCOPE_PRIVATE

    assets = Asset.accessible_by_user(user).
      where(
        state: Asset::STATE_CLOSED,
        uid: opts[:ordered_assets],
      )

    App.transaction do
      app_series = create_app_series(opts[:name], scope)
      release = opts.fetch(:release, UBUNTU_16)
      revision = app_series.latest_revision_app.try(:revision).to_i + 1

      applet_dxid = new_applet(
        opts.slice(
          :input_spec,
          :output_spec,
          :code,
          :instance_type,
          :packages,
          :internet_access,
        ),
        release,
      )

      app_dxid = new_app(
        opts.slice(
          :name,
          :title,
          :internet_access,
          :readme,
        ).merge(
          applet_dxid: applet_dxid,
          asset_dxids: assets.map(&:dxid),
          revision: revision,
          scope: scope,
        ),
      )

      api.project_remove_objects(project, [applet_dxid])

      app = App.create!(
        dxid: app_dxid,
        version: nil,
        revision: revision,
        title: opts[:title],
        readme: opts[:readme],
        user: user,
        scope: scope,
        app_series: app_series,
        input_spec: opts[:input_spec],
        output_spec: opts[:output_spec],
        internet_access: opts[:internet_access],
        instance_type: opts[:instance_type],
        ordered_assets: opts[:ordered_assets],
        packages: opts[:packages],
        code: opts[:code].strip,
        assets: assets,
        release: release,
      )

      app_series.update!(latest_revision_app: app)
      app_series.update!(latest_version_app: app) if Space.valid_scope?(scope)

      Event::AppCreated.create_for(app, user)
    end

    app
  end

  # Creates new applet on the platform.
  # @param opts [Hash] Opts to create hash with.
  # @return [String] Created applet id.
  def new_applet(opts, release)
    api.applet_new(
      project,
      inputSpec: opts[:input_spec].map { |spec| spec.except("default", "choices") },
      outputSpec: opts[:output_spec],
      runSpec: {
        code: code_remap(opts[:code].strip),
        interpreter: "bash",
        systemRequirements: {
          "*" => { instanceType: Job::INSTANCE_TYPES[opts[:instance_type]] },
        },
        distribution: "Ubuntu",
        release: release,
        execDepends: opts[:packages].map { |package| { name: package } },
      },
      dxapi: "1.0.0",
      access: opts[:internet_access] ? { network: ["*"] } : {},
    )["id"]
  end

  # Creates new app on the platform.
  # @param opts [Hash] Options to create app with.
  # @return [String] Created app id.
  def new_app(opts)
    api.app_new(
      applet: opts[:applet_dxid],
      name: AppSeries.construct_dxname(user.username, opts[:name], opts[:scope]),
      title: "#{opts[:title]} ",
      summary: " ",
      description: "#{opts[:readme]} ",
      version: "r#{opts[:revision]}-#{SecureRandom.hex(3)}",
      resources: opts[:asset_dxids],
      details: { ordered_assets: opts[:asset_dxids] },
      openSource: false,
      billTo: bill_to,
      access: opts[:internet_access] ? { network: ["*"] } : {},
    )["id"]
  end

  private

  # Finds or creates new app series.
  # @param app_name [String] Name of app series to create with or to find by.
  # @return [AppSeries] Found or created app series.
  def create_app_series(app_name, scope)
    app_series_dxid = AppSeries.construct_dxid(user.username, app_name, scope)

    AppSeries.create_with(
      name: app_name,
      user: user,
      scope: scope,
    ).find_or_create_by(
      dxid: app_series_dxid,
    )
  end

  # Returns user's billTo.
  # @return [String] User's billTo.
  def bill_to
    user.billto
  end

  # Returns user's private files project.
  # @return [String] User private files project's dxid.
  def project
    user.private_files_project
  end

  # Remaps the code.
  # @param code [String] Code to remap.
  def code_remap(code)
    <<~END_OF_CODE
      dx cat #{APPKIT_TGZ} | tar -z -x -C / --no-same-owner --no-same-permissions -f -
      source /usr/lib/app-prologue
      #{code}
      { set +x; } 2>/dev/null
      source /usr/lib/app-epilogue
    END_OF_CODE
  end

  attr_reader :user, :api
end
