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
    app_uid = https_apps_client.app_save(opts)
    App.find_by!(uid: app_uid)
  end

  # Determine a proper scope for new app copy, depends upon current scope.
  # Every new revision is private or of current space scope.
  # @param scope [String] 'private', 'public', nil or 'space-xxx'
  # @return scope [String] 'private' or 'space-xxx'
  def select_scope(scope)
    if [Scopes::SCOPE_PRIVATE, Scopes::SCOPE_PUBLIC, nil].include?(scope)
      Scopes::SCOPE_PRIVATE
    else
      scope
    end
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
        version: "0",
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

  def https_apps_client
    @https_apps_client ||= HttpsAppsClient.new
  end
end
