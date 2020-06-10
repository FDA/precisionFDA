# Responsible for apps-related actions.
class AppsController < ApplicationController
  include ErrorProcessable

  skip_before_action :require_login, only: %i(index featured explore show fork new)
  before_action :require_login_or_guest, only: %i(index featured explore show fork new)
  before_action :validate_app_before_export, only: %i(export cwl_export wdl_export)

  def index
    if @context.guest?
      redirect_to explore_apps_path
      return
    end

    @app = nil
    @assignable_challenges = []

    if unsafe_params[:id].present?
      @app = App.accessible_by(@context).find_by(uid: unsafe_params[:id])

      if @app.nil?
        flash[:error] = I18n.t("app_not_accessible")
        redirect_to apps_path
        return
      else
        @items_from_params = [@app]
        @item_path = pathify(@app)
        @item_comments_path = pathify_comments(@app)

        if @app.in_space?
          space = item_from_uid(@app.scope)
          @comments = Comment.
            where(commentable: space, content_object: @app).
            order(id: :desc).
            page(unsafe_params[:comments_page])
        else
          @comments = @app.root_comments.order(id: :desc).page unsafe_params[:comments_page]
        end

        load_relations
      end
    end
    @my_apps = AppSeries.editable_by(@context).
      eager_load(latest_revision_app: [user: :org], latest_version_app: [user: :org]).
      order(created_at: :desc).
      map { |series| series.latest_accessible(@context) }.compact

    @ran_apps = AppSeries.accessible_by(@context).
      eager_load(latest_revision_app: [user: :org], latest_version_app: [user: :org]).
      order(created_at: :desc).where.not(user_id: @context.user_id).joins(:jobs).distinct.
      where(jobs: { user_id: @context.user_id }).
      map { |series| series.latest_accessible(@context) }.compact

    User.sync_jobs!(@context)

    jobs = if @app.present?
      @app.app_series.jobs.origin.editable_by(@context).order(created_at: :desc)
    else
      Job.origin.editable_by(@context).order(created_at: :desc)
    end

    @jobs_grid = jobs_grid(jobs.includes(:taggings, analysis: :workflow))

    js js_info(@app, @assignable_challenges)
  end

  def export
    send_data(
      @app.to_docker(@context.token),
      type: "text; charset=utf-8",
      disposition: "attachment",
      filename: "Dockerfile",
    )
  end

  def cwl_export
    send_data(cwl_exporter.app_export(@app), filename: "#{@app.name}.tar.gz")
  end

  def wdl_export
    send_data(wdl_exporter.app_export(@app), filename: "#{@app.name}.tar.gz")
  end

  def featured
    org = Org.featured

    if org
      apps = AppSeries.
        accessible_by_public.
        includes(:user, :taggings).
        where(users: { org_id: org.id }).
        order(created_at: :desc)

      @apps_grid = apps_grid(apps)
    end

    render :list
  end

  def explore
    apps = AppSeries.
      accessible_by_public.
      includes(:latest_version_app, :taggings).
      order(created_at: :desc)

    @apps_grid = apps_grid(apps)
    render :list
  end

  def show
    @app = App.accessible_by(@context).find_by(uid: unsafe_params[:id])

    if @app.nil?
      flash[:error] = I18n.t("app_not_accessible")
      redirect_to apps_path

      return
    end

    load_relations

    @items_from_params = [@app]
    @item_path = pathify(@app)
    @item_comments_path = pathify_comments(@app)

    if @app.in_space?
      space = item_from_uid(@app.scope)
      @comments = Comment.
        where(commentable: space, content_object: @app).
        order(id: :desc).
        page(unsafe_params[:comments_page])
    else
      @comments = @app.
        root_comments.
        order(id: :desc).
        page(unsafe_params[:comments_page])
    end

    User.sync_jobs!(@context)

    jobs = @app.app_series.jobs.editable_by(@context).includes(:taggings).order(created_at: :desc)
    @jobs_grid = jobs_grid(jobs)

    js js_info(@app, @assignable_challenges)
  end

  def update
    @app = App.editable_by(@context).find_by!(id: unsafe_params[:id])

    respond_to do |format|
      format.json { render json: { ok: 1 } }
    end
  end

  def edit
    @app = App.find_by(uid: unsafe_params[:id])
    @app = nil unless @app.editable_by?(@context)

    if @app.nil?
      flash[:error] = I18n.t("app_not_accessible")
      redirect_to apps_path && return
    elsif @app.id != @app.app_series.latest_revision_app_id
      redirect_to edit_app_path(@app.app_series.latest_revision_app) && return
    else
      attrs = %i(dxid name scope title version revision readme spec internal release)
      js(app: @app.slice(*attrs), ubuntu_releases: UBUNTU_RELEASES)
    end
  end

  def new
    if @context.guest?
      redirect_to login_url
      return
    end

    js(ubuntu_releases: UBUNTU_RELEASES, app: { release: UBUNTU_16 })
  end

  # rubocop:disable Metrics/MethodLength
  def batch_app
    @app = App.accessible_by(@context).find_by(uid: unsafe_params[:id])

    if @app.nil?
      flash[:error] = I18n.t("app_not_accessible")
      redirect_to apps_path
      return
    end

    licenses_to_accept = []
    @app.assets.each do |asset|
      next unless asset.license.present? && !asset.licensed_by?(@context)

      licenses_to_accept << {
        license: describe_for_api(asset.license),
        user_license: asset.user_license(@context),
      }
    end

    licenses_accepted = @context.user.accepted_licenses.map do |license|
      {
        id: license.license_id,
        pending: license.pending?,
        active: license.active?,
        unset: !license.pending? && !license.active?,
      }
    end

    available_spaces = @app.available_job_spaces(@context.user)

    selectable_spaces = available_spaces.map do |space|
      { value: space.id, label: space.title, space_type: space.space_type }
    end

    content_scopes = available_spaces.each_with_object({}) do |space, memo|
      memo[space.id] = space.accessible_scopes
    end

    js(
      app: @app.slice(:uid, :spec, :title, :space_scopes),
      licenses_to_accept: licenses_to_accept.uniq(&:id),
      licenses_accepted: licenses_accepted,
      selectable_spaces: selectable_spaces,
      content_scopes: content_scopes,
    )
  end
  # rubocop:enable Metrics/MethodLength

  def fork
    @app = App.accessible_by(@context).find_by(uid: unsafe_params[:id])

    if @app.nil?
      flash[:error] = I18n.t("app_fork_forbidden")
      redirect_to apps_path && return
    else
      attrs = %i(dxid name title version revision readme spec internal release)
      js(app: @app.slice(*attrs), ubuntu_releases: UBUNTU_RELEASES)
    end
  end

  # Inputs
  #
  # id (string, required): the dxid of the app to run
  # name (string, required): the name of the job
  # inputs (hash, required): the inputs
  # instance_type (string, optional): override of the default instance type
  #
  # Outputs
  #
  # id (string): the dxid of the resulting job
  # rubocop:disable Metrics/MethodLength
  def run
    # rubocop:disable Style/SignalException
    # Parameter 'id' should be of type String
    id = unsafe_params[:id]
    fail "App ID is not a string" unless id.is_a?(String) && id != ""

    # Name should be a nonempty string
    name = unsafe_params[:name]
    fail "Name should be a non-empty string" unless name.is_a?(String) && name != ""

    # Inputs should be a hash (more checks later)
    inputs = unsafe_params["inputs"]
    fail "Inputs should be a hash" unless inputs.is_a?(Hash)

    # App should exist and be accessible and runnable by a user.
    @app = App.find_by!(uid: id)

    fail I18n.t("app_not_accessible_or_runnable") unless @app.runnable_by?(current_user)

    # Check if asset licenses have been accepted
    unless @app.assets.all? { |a| a.license.blank? || a.licensed_by?(@context) }
      fail "Asset licenses must be accepted"
    end

    space_id = unsafe_params[:space_id]

    fail "Invalid space_id" if space_id && !@app.can_run_in_space?(@context.user, space_id)

    space = Space.find_by(id: space_id)
    # Inputs should be compatible
    # (The following also normalizes them)
    input_info = input_spec_preparer.run(@app, inputs, space&.accessible_scopes)

    fail input_spec_preparer.first_error unless input_spec_preparer.valid?

    run_instance_type = unsafe_params[:instance_type]

    # User can override the instance type
    if run_instance_type
      fail "Invalid instance type selected" unless Job::INSTANCE_TYPES.key?(run_instance_type)
    end

    if space
      project = space.project_for_user(@context.user)
      permission = space.have_permission?(project, @context.user)
      fail "You don't have permissions to run app in space #{space.name}" unless permission
    else
      project = @context.user.private_files_project
    end

    job = job_creator(project).create(
      app: @app,
      name: name,
      input_info: input_info,
      run_instance_type: run_instance_type,
      scope: space&.uid,
    )

    SpaceEventService.call(space_id, @context.user_id, nil, job, :job_added) if space&.review?
    # rubocop:enable Style/SignalException

    render json: { id: job.uid }
  end
  # rubocop:enable Metrics/MethodLength

  private

  # Creates (if required) and returns an instance of JobCreator.
  # @param project_dxid [String] Project to run job for.
  # @return [JobCreator]
  def job_creator(project_dxid)
    @job_creator ||= JobCreator.new(
      api: DNAnexusAPI.new(@context.token),
      context: @context,
      user: @context.user,
      project: project_dxid,
    )
  end

  # Returns instance of #InputSpecPreparer.
  # @return [InputSpecPreparer]
  def input_spec_preparer
    @input_spec_preparer ||= InputSpecPreparer.new(@context)
  end

  # Builds hash for frontend and returns it.
  # @param app [App] App.
  # @param challenges [ActiveRecord::Relation<Challenge>] Challenges.
  # @return [Hash]
  def js_info(app, challenges)
    app_attrs = app&.slice(
      :id, :uid, :dxid, :scope, :title, :readme, :revision, :dev_group, :release
    )&.merge(link: app_path(app))

    challenges_attrs = if app
      challenges.map do |challenge|
        ch_app = challenge.app

        {
          id: challenge.id,
          name: challenge.name,
          link: challenge.is_viewable?(@context) ? challenge_path(challenge.id) : nil,
          assign_link: assign_app_challenge_path(id: challenge.id, app_id: app.id),
          app: {
            id: ch_app&.dxid,
            scope: ch_app&.scope,
            title: ch_app&.title,
            revision: ch_app&.revision,
            link: ch_app && app_path(ch_app),
          },
        }
      end
    end

    {
      app: app_attrs,
      ubuntu_releases: UBUNTU_RELEASES,
      challenges: challenges_attrs || [],
    }
  end

  # Builds apps gird and returns it.
  # @param apps [ActiveRecord::Relation<App>] Apps to build grid for.
  # @return [WiceGrid] Built grid.
  def apps_grid(apps)
    initialize_grid(
      apps,
      name: "apps",
      order: "apps.created_at",
      order_direction: "desc",
      per_page: 100,
      include: [{ user: :org }, :latest_version_app, { taggings: :tag }],
    )
  end

  # Builds jobs gird and returns it.
  # @param jobs [ActiveRecord::Relation<Job>] Jobs to build grid for.
  # @return [WiceGrid] Built grid.
  def jobs_grid(jobs)
    initialize_grid(
      jobs,
      name: "jobs",
      order: "jobs.id",
      order_direction: "desc",
      per_page: 100,
    )
  end

  # Creates (if required) and returns instance of CwlExporter.
  # @return [CwlExporter] CWL Exporter.
  def cwl_exporter
    @cwl_exporter ||= CwlExporter.new(@context.token)
  end

  # Creates (if required) and returns instance of WdlExporter.
  # @return [WdlExporter] WDL Exporter.
  def wdl_exporter
    @wdl_exporter ||= WdlExporter.new(@context.token)
  end

  def validate_app_before_export
    # App should exist and be accessible
    @app = App.accessible_by(@context).find_by!(uid: unsafe_params[:id])

    # Assets should be accessible and licenses accepted
    if @app.assets.accessible_by(@context).count != @app.assets.count
      flash[:error] = I18n.t("app_not_exportable")
      redirect_to app_path(@app) && return
    end

    # rubocop:disable Style/GuardClause
    if @app.assets.any? { |a| a.license.present? && !a.licensed_by?(@context) }
      flash[:error] = I18n.t("app_licence_not_accepted")
      redirect_to app_path(@app) && return
    end
    # rubocop:enable Style/GuardClause
  end

  # Loads common relations and sets appropriate instance variables.
  def load_relations
    @revisions = @app.
      app_series.
      accessible_revisions(@context).
      select(:title, :id, :uid, :revision, :version)

    @notes = @app.
      notes.
      real_notes.
      accessible_by(@context).
      order(id: :desc).
      page(unsafe_params[:notes_page])

    @answers = @app.
      notes.
      accessible_by(@context).
      answers.order(id: :desc).
      page(unsafe_params[:answers_page])

    @discussions = @app.
      notes.
      accessible_by(@context).
      discussions.
      order(id: :desc).page(unsafe_params[:discussions_page])

    @assigned_challenges = Challenge.
      where(app_id: @app.id).
      order(created_at: :desc)

    @assignable_challenges = Challenge.
      all.
      order(created_at: :desc).
      select { |c| c.can_assign_specific_app?(@context, @app) }
  end
end
