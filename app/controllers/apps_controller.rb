class AppsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show, :fork, :new]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show, :fork, :new]
  before_action :validate_app_before_export, only: [:export, :cwl_export, :wdl_export]

  def index
    if @context.guest?
      redirect_to explore_apps_path
      return
    end

    @app = nil
    @assignable_challenges = []

    if params[:id].present?
      @app = App.accessible_by(@context).find_by_uid(params[:id])
      if @app.nil?
        flash[:error] = "Sorry, this app does not exist or is not accessible by you"
        redirect_to apps_path
        return
      else
        @items_from_params = [@app]
        @item_path = pathify(@app)
        @item_comments_path = pathify_comments(@app)
        if @app.in_space?
          space = item_from_uid(@app.scope)
          @comments = Comment.where(commentable: space, content_object: @app).order(id: :desc).page params[:comments_page]
        else
          @comments = @app.root_comments.order(id: :desc).page params[:comments_page]
        end

        @revisions = @app.app_series.accessible_revisions(@context).select(:title, :id, :uid, :revision, :version)
        @notes = @app.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
        @answers = @app.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
        @discussions = @app.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]

        @assigned_challenges = Challenge.where(app_id: @app.id)
        @assignable_challenges = Challenge.select{ |c| c.can_assign_specific_app?(@context, @app) }
      end
    end

    @my_apps = AppSeries.editable_by(@context).order(name: :asc).map { |s| s.latest_accessible(@context) }.reject(&:nil?)

    @ran_apps = AppSeries.accessible_by(@context).order(name: :asc).where.not(user_id: @context.user_id).joins(:jobs).distinct.where(:jobs => { :user_id => @context.user_id }).map { |s| s.latest_accessible(@context) }.reject(&:nil?)

    User.sync_jobs!(@context)
    if @app.present?
      jobs = @app.app_series.jobs.origin.editable_by(@context)
    else
      jobs = Job.origin.editable_by(@context)
    end
    @jobs_grid = initialize_grid(jobs.includes(:taggings, analysis: :workflow), {
      name: 'jobs',
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })

    js js_info(@app, @assignable_challenges)
  end

  def export
    send_data @app.to_docker(@context.token), :type => 'text; charset=utf-8', :disposition => 'attachment', :filename => 'Dockerfile'
  end

  def cwl_export
    send_data cwl_exporter.app_export(@app), :filename => "#{@app.name}.tar.gz"
  end

  def wdl_export
    send_data wdl_exporter.app_export(@app), :filename => "#{@app.name}.tar.gz"
  end

  def featured
    org = Org.featured
    if org
      @apps_grid = initialize_grid(AppSeries.accessible_by_public.includes(:user, :taggings).where(:users => { :org_id => org.id }), {
        name: 'apps',
        order: 'apps.created_at',
        order_direction: 'desc',
        per_page: 100,
        include: [{user: :org}, :latest_version_app, {taggings: :tag}]
      })
    end
    render :list
  end

  def explore
    @apps_grid = initialize_grid(AppSeries.accessible_by_public.includes( :latest_version_app, :taggings), {
      name: 'apps',
      order: 'apps.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [{user: :org}, :latest_version_app, {taggings: :tag}]
    })
    render :list
  end

  def show
    @app = App.accessible_by(@context).find_by_uid(params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    @revisions = @app.app_series.accessible_revisions(@context).select(:title, :id, :uid, :revision, :version)
    @notes = @app.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @app.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @app.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]
    @assigned_challenges = Challenge.where(app_id: @app.id)
    @assignable_challenges = Challenge.select{ |c| c.can_assign_specific_app?(@context, @app) }

    @items_from_params = [@app]
    @item_path = pathify(@app)
    @item_comments_path = pathify_comments(@app)
    if @app.in_space?
      space = item_from_uid(@app.scope)
      @comments = Comment.where(commentable: space, content_object: @app).order(id: :desc).page params[:comments_page]
    else
      @comments = @app.root_comments.order(id: :desc).page params[:comments_page]
    end

    User.sync_jobs!(@context)

    jobs = @app.app_series.jobs.editable_by(@context).includes(:taggings)
    @jobs_grid = initialize_grid(jobs, {
      name: 'jobs',
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })

    js js_info(@app, @assignable_challenges)
  end


  def js_info(app, challenges)
    {
      app: (app.slice(:id, :dxid, :title, :readme, :revision, :dev_group).merge(link: app_path(app)) rescue nil),
      challenges: challenges.collect do |challenge|
        {
          id: challenge.id,
          name: challenge.name,
          link: (challenge.is_viewable?(@context) ? challenge_path(challenge.id) : nil),
          assign_link: assign_app_challenge_path(id: challenge.id, app_id: app.id),
          app: {
            id: (challenge.app.dxid rescue nil),
            title: (challenge.app.title rescue nil),
            revision: (challenge.app.revision rescue nil),
            link: (app_path(challenge.app) rescue nil)
          }
        }
      end
    }
  end

  def update
    @app = App.editable_by(@context).find_by!(id: params[:id])

    respond_to do |format|
      format.json { render json: {ok: 1}}
    end
  end

  def edit
    @app = App.editable_by(@context).find_by_uid(params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    else
      if @app.id != @app.app_series.latest_revision_app_id
        redirect_to edit_app_path(@app.app_series.latest_revision_app)
        return
      else
        js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
      end
    end
  end

  def new
  end

  def batch_app
    @app = App.accessible_by(@context).find_by_uid(params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    licenses_to_accept = []
    @app.assets.each do |asset|
      if asset.license.present? && !asset.licensed_by?(@context)
        licenses_to_accept << {
          license: describe_for_api(asset.license),
          user_license: asset.user_license(@context)
        }
      end
    end

    licenses_accepted = @context.user.accepted_licenses.map{|l| {id: l.license_id, pending: l.pending?, active: l.active?, unset: !l.pending? && !l.active?}}

    js app: @app.slice(:uid, :spec, :title), licenses_to_accept: licenses_to_accept.uniq { |l| l.id}, licenses_accepted: licenses_accepted
  end

  def fork
    @app = App.accessible_by(@context).find_by_uid(params[:id])
    if @app.nil?
      flash[:error] = "Sorry, you do not have permissions to fork this app"
      redirect_to apps_path
      return
    else
      js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
    end
  end

  private

  def cwl_exporter
    @cwl_exporter ||= CwlExporter.new(@context.token)
  end

  def wdl_exporter
    @wdl_exporter ||= WdlExporter.new(@context.token)
  end

  def validate_app_before_export
    # App should exist and be accessible
    @app = App.accessible_by(@context).find_by_uid!(params[:id])

    # Assets should be accessible and licenses accepted
    if @app.assets.accessible_by(@context).count != @app.assets.count
      flash[:error] = "This app cannot be exported because one or more assets are not accessible by the current user."
      redirect_to app_path(@app)
      return
    end
    if @app.assets.any? { |a| a.license.present? && !a.licensed_by?(@context) }
      flash[:error] = "This app contains one or more assets which need to be licensed. Please run the app first in order to accept the licenses."
      redirect_to app_path(@app)
      return
    end
  end
end
