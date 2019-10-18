class AppService
  class << self
    def create_app(context, options)
      new(context).create_app(options)
    end
  end

  def initialize(context)
    @context = context
  end

  def create_app(opts)
    app = nil

    assets =
      Asset.accessible_by(context).
        where(
          state: Asset::STATE_CLOSED,
          uid: opts[:ordered_assets]
        )

    App.transaction do
      app_series = create_app_series(opts[:name])

      revision = app_series.latest_revision_app.try(:revision).to_i + 1

      applet_dxid = new_applet(
        opts.slice(
          :name,
          :input_spec,
          :output_spec,
          :code,
          :instance_type,
          :packages,
          :internet_access
        )
      )

      app_dxid = new_app(
        opts.slice(
          :name,
          :title,
          :internet_access,
          :readme
        ).merge(
          applet_dxid: applet_dxid,
          asset_dxids: assets.map(&:dxid),
          revision: revision
        )
      )

      api.call(project, "removeObjects", { objects: [applet_dxid] } )

      app = App.create!(
        dxid: app_dxid,
        version: nil,
        revision: revision,
        title: opts[:title],
        readme: opts[:readme],
        user: context.user,
        scope: "private",
        app_series: app_series,
        input_spec: opts[:input_spec],
        output_spec: opts[:output_spec],
        internet_access: opts[:internet_access],
        instance_type: opts[:instance_type],
        ordered_assets: opts[:ordered_assets],
        packages: opts[:packages],
        code: opts[:code].strip,
        assets: assets
      )

      app_series.update!(latest_revision_app_id: app.id)

      Event::AppCreated.create_for(app, context.user)
    end

    app
  end

  def new_applet(opts)
    api.call("applet", "new", {
      project: project,
      inputSpec: opts[:input_spec].map{ |spec| spec.except("default", "choices") },
      outputSpec: opts[:output_spec],
      runSpec: {
        code: code_remap(opts[:code].strip),
        interpreter: "bash",
        systemRequirements: {
          "*" => { instanceType: Job::INSTANCE_TYPES[opts[:instance_type]] }
        },
        distribution: "Ubuntu",
        release: "14.04",
        execDepends: opts[:packages].map { |package| { name: package } }
      },
      dxapi: "1.0.0",
      access: opts[:internet_access] ? { network: ["*"] } : {}
    })["id"]
  end

  def new_app(opts)
    api.app_new(
      applet: opts[:applet_dxid],
      name: AppSeries.construct_dxname(context.username, opts[:name]),
      title: "#{opts[:title]} ",
      summary: " ",
      description: "#{opts[:readme]} ",
      version: "r#{opts[:revision]}-#{SecureRandom.hex(3)}",
      resources: opts[:asset_dxids],
      details: { ordered_assets: opts[:asset_dxids] },
      openSource: false,
      billTo: bill_to,
      access: opts[:internet_access] ? { network: ["*"] } : {}
    )["id"]
  end

  private

  def create_app_series(app_name)
    app_series_dxid = AppSeries.construct_dxid(context.username, app_name)

    AppSeries.create_with(
      name: app_name,
      user: context.user,
      scope: "private"
    ).find_or_create_by(
      dxid: app_series_dxid
    )
  end

  def bill_to
    context.user.billto
  end

  def project
    context.user.private_files_project
  end

  def code_remap(code)
    <<-END_OF_CODE
dx cat #{APPKIT_TGZ} | tar -z -x -C / --no-same-owner --no-same-permissions -f -
source /usr/lib/app-prologue
#{code}
{ set +x; } 2>/dev/null
source /usr/lib/app-epilogue
END_OF_CODE
  end

  def api
    @api ||= DNAnexusAPI.new(context.token)
  end

  attr_reader :context
end
