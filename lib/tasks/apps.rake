# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/MethodLength
namespace :apps do
  INSTANCE_TYPES = {
    "baseline-4" => "mem1_ssd1_v2_x4",
  }.freeze

  def run(app_name)
    api = DNAnexusAPI.for_admin

    app_dxid = api.system_find_apps(name: app_name)["results"].first&.fetch("id", nil)

    abort "Can't find the app '#{app_name}' on the Platform" unless app_dxid

    puts "Found the app with dxid #{app_dxid} on the Platform"

    app_info = api.app_describe(app_dxid)

    created_by = User.find_by(dxuser: app_info["createdBy"].sub(/^user-/, "")) ||
                 ENV["CREATED_BY"].present? && User.find_by(dxuser: ENV["CREATED_BY"]) ||
                 User.find_by(dxuser: ADMIN_USER.sub(/^user-/, ""))

    abort "Can't determine a createdBy user for the app" unless created_by

    app_scope = Scopes::SCOPE_PUBLIC

    ActiveRecord::Base.transaction do
      app_series = create_app_series(app_info["name"], created_by, app_scope)
      latest_revision_app = app_series.latest_revision_app
      latest_revision = latest_revision_app&.revision.to_i

      if latest_revision > 0
        puts "Found already existing '#{app_name}' app with the last revision #{latest_revision}"

        if app_info["version"] == latest_revision_app.version
          abort "The app on the platform has the same version as the existing one. " +
                "Nothing to transfer"
        end
      end

      instance_type = app_info.dig("runSpec", "systemRequirements").values.first["instanceType"]
      baseline = INSTANCE_TYPES.invert[instance_type] || "baseline-4"

      internet_access = app_info.dig("access", "network").first == "*"
      release = app_info.dig("runSpec", "release")

      input_spec = app_info["inputSpec"].select do |spec|
        is_supported = %w(string file int boolean float).include?(spec["class"])
        puts "Unhandled class #{spec['class']}" unless is_supported
        is_supported
      end

      output_spec = app_info["outputSpec"].select do |spec|
        spec["class"] = spec["class"].sub(/^array:/, "")
        %w(string file int boolean float).include?(spec["class"])
      end

      packages = app_info.dig("runSpec", "execDepends").map do |package|
        if package["package_manager"].blank? && UBUNTU_PACKAGES[release].include?(package["name"])
          package["name"]
        end
      end.compact

      assets = app_info.dig("runSpec", "bundledDepends").map do |asset_data|
        asset_dxid = asset_data.dig("id", "$dnanexus_link")
        asset_name = asset_data["name"]

        asset = Asset.find_by(dxid: asset_dxid)

        unless asset
          described = api.file_describe(asset_dxid)

          asset = Asset.create!(
            project: described["project"],
            dxid: asset_dxid,
            name: asset_name,
            state: described["state"],
            file_size: described["size"],
            user: created_by,
            scope: Scopes::SCOPE_PUBLIC,
          )

          asset.update!(parent_type: "Asset", parent_id: asset.id)
        end

        asset
      end.compact

      revision = latest_revision + 1

      puts "The new app will be created with the revision #{revision}"

      app = App.create!(
        dxid: app_dxid,
        version: app_info["version"],
        revision: revision,
        title: app_info["title"],
        readme: app_info["description"],
        user: created_by,
        scope: app_scope,
        app_series: app_series,
        input_spec: input_spec,
        output_spec: output_spec,
        internet_access: internet_access,
        instance_type: baseline,
        ordered_assets: assets.map(&:uid),
        packages: packages,
        code: nil,
        assets: assets,
        release: app_info.dig("runSpec", "release"),
        entity_type: app_info["httpsApp"].present? ? App::TYPE_HTTPS : App::TYPE_REGULAR,
      )

      app_series.update!(latest_revision_app: app, latest_version_app: app)
    end
  end

  def create_app_series(app_name, user, app_scope)
    app_series_dxid = AppSeries.construct_dxid(user.username, app_name, app_scope)

    AppSeries.create_with(
      name: app_name,
      user: user,
      scope: app_scope,
    ).find_or_create_by!(
      dxid: app_series_dxid,
    )
  end

  desc "Transfer a public app from the Platform by name. " +
       "Create a new revision if app version is changed."
  task :transfer, [:app_name] => :environment do |_, args|
    abort "Please provide the app name to transfer" unless args.app_name

    run(args.app_name)
  end
end
# rubocop:enable Metrics/BlockLength
# rubocop:enable Metrics/MethodLength
