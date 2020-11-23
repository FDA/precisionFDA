namespace :apps do
  INSTANCE_TYPES = {
    "baseline-4" => "mem1_ssd1_v2_x4",
  }.freeze

  def run(app_dxid)
    api = DNAnexusAPI.for_admin

    abort "Can't find public app '*#{app_dxid}*' in the Platform" unless app_dxid

    p "Found #{app_dxid} app in the Platform"

    app_info = api.app_describe(app_dxid)

    created_by = User.find_by(dxuser: app_info['createdBy'].sub(/^user-/, "")) ||
                 User.find_by(dxuser: ADMIN_USER.sub(/^user-/, ""))

    abort "Can't find createdBy user for the app" unless created_by

    app_scope = Scopes::SCOPE_PUBLIC

    instance_type = app_info.dig("runSpec", "systemRequirements").values.first["instanceType"]
    baseline = INSTANCE_TYPES.invert[instance_type] || "baseline-4"

    internet_access = app_info.dig("access", "network").first == "*"
    release = app_info.dig("runSpec", "release")

    input_spec = app_info["inputSpec"].select do |spec|
      is_supported = %w(string file int boolean float).include?(spec["class"])
      p "Unhandler class '#{spec["class"]}'" unless is_supported
      is_supported
    end

    output_spec = app_info["outputSpec"].select do |spec|
      %w(string file int boolean float).include?(spec["class"])
    end

    packages = app_info.dig("runSpec", "execDepends").map do |package|
      package["package_manager"].blank? && UBUNTU_PACKAGES[release].include?(package["name"]) ? package["name"] : nil
    end.compact

    ActiveRecord::Base.transaction do
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

      app_series = create_app_series(app_info["name"], created_by, app_scope)

      app = App.create!(
        dxid: app_dxid,
        version: app_info["version"],
        revision: 1,
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
        code: "", # TODO
        assets: assets,
        release: app_info.dig("runSpec", "release"),
        entity_type: app_info["httpsApp"].present? ? App::TYPE_HTTPS : App::TYPE_REGULAR
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

  desc "Transfer app from the Platform by ID"
  task :transfer, [:app_dxid] => :environment do |_, args|
    abort "Please provide APP DXID to transfer" unless args.app_dxid
    abort "App already exists in pFDA" if App.find_by(dxid: args.app_dxid)

    run(args.app_dxid)
  end
end
