class AppsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show, :fork, :new]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show, :fork, :new]

  def index
    if @context.guest?
      redirect_to explore_apps_path
      return
    end

    js_param = {}
    @app = nil
    if params[:id].present?
      @app = App.accessible_by(@context).find_by(dxid: params[:id])
      if @app.nil?
        flash[:error] = "Sorry, this app does not exist or is not accessible by you"
        redirect_to apps_path
        return
      else
        @items_from_params = [@app]
        @item_path = pathify(@app)
        @item_comments_path = pathify_comments(@app)
        @comments = @app.root_comments.order(id: :desc).page params[:comments_page]

        @revisions = @app.app_series.accessible_revisions(@context).select(:title, :id, :dxid, :revision, :version)
        @notes = @app.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
        @answers = @app.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
        @discussions = @app.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]
      end
      js_param[:app] = @app.slice(:id, :dxid, :readme)
    end

    @my_apps = AppSeries.editable_by(@context).order(name: :asc).map { |s| s.latest_accessible(@context) }.reject(&:nil?)

    @ran_apps = AppSeries.accessible_by(@context).order(name: :asc).where.not(user_id: @context.user_id).joins(:jobs).distinct.where(:jobs => { :user_id => @context.user_id }).map { |s| s.latest_accessible(@context) }.reject(&:nil?)


    User.sync_jobs!(@context)
    if @app.present?
      jobs = @app.app_series.jobs.editable_by(@context)
    else
      jobs = Job.editable_by(@context)
    end
    @jobs_grid = initialize_grid(jobs, {
      name: 'jobs',
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })
    js js_param
  end

  def export
    # App should exist and be accessible
    @app = App.accessible_by(@context).find_by!(dxid: params[:id])

    # Assets should be accessible and licenses accepted
    if @app.assets.accessible_by(@context).count != @app.assets.count
      flash[:error] = "This app cannot be exported because one or more assets are not accessible by the current user."
      redirect_to app_path(@app.dxid)
      return
    end
    if @app.assets.any? { |a| a.license.present? && !a.licensed_by?(@context) }
      flash[:error] = "This app contains one or more assets which need to be licensed. Please run the app first in order to accept the licenses."
      redirect_to app_path(@app.dxid)
      return
    end

    # Generate Dockerfile for app
    cmds = []
    cmds << "# For more information on how to use this file, please refer to 'Export Apps' in the PFDA Docs section"
    cmds << "# Start with Ubuntu 14.04 base image"
    cmds << "FROM ubuntu:14.04"
    cmds << ""

    apt_packages = [
      "aria2",
      "byobu",
      "cmake",
      "cpanminus",
      "curl",
      "dstat",
      "g++",
      "git",
      "htop",
      "libboost-all-dev",
      "libcurl4-openssl-dev",
      "libncurses5-dev",
      "make",
      "perl",
      "pypy",
      "python-dev",
      "python-pip",
      "r-base",
      "ruby1.9.3",
      "wget",
      "xz-utils"
    ]
    cmds << "# install apt-packages"
    cmds << "# don't use ENV to set DEBIAN_FRONTEND"
    cmds << "RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y \\\n\t#{apt_packages.join(" \\\n\t")}"
    cmds << ""

    python_packages = [
      "requests==2.5.0",
      "futures==2.2.0",
      "setuptools==10.2"
    ]
    cmds << "# install python packages"
    cmds << "RUN pip install \\\n\t#{python_packages.join(" \\\n\t")}"
    cmds << ""

    cmds << "# create directory /work and set it to $HOME and CWD"
    cmds << "RUN mkdir /work"
    cmds << "ENV HOME=\"/work\""
    cmds << "WORKDIR /work"
    cmds << ""

    cmds << "# Download pfda executables"
    # TODO: Permify these links before going live!
    cmds << "RUN curl https://dl.dnanex.us/F/D/75X9k0Q0p5vyV4PxxjyKZBqy7Y7f4GYf1bxBX349/emit-1.0.tar.gz | tar xzf - -C /usr/bin/ --no-same-owner --no-same-permissions"
    cmds << "RUN curl https://dl.dnanex.us/F/D/qqyqB2xGKF0q9B3xp1qJPvvg6gBQ3yZ86v1qg8ZY/pfda-1.0.6.tar.gz | tar xzf - -C /usr/bin/ --no-same-owner --no-same-permissions"
    cmds << "RUN curl https://dl.dnanex.us/F/D/GFZk04jxBjzJgy0z3BVFBqFg9FX6z46FFG8Z279G/run-1.0.tar.gz | tar xzf - -C /usr/bin/ --no-same-owner --no-same-permissions"
    cmds << ""

    # Generate download URLs and Docker commands for each asset
    cmds << "# Download app assets"
    @app.assets.sort_by { |asset| @app.ordered_assets.find_index(asset.dxid) }.each do |asset|
      url = DNAnexusAPI.new(@context.token).call(asset.dxid, "download", {filename: asset.name, project: asset.project, preauthenticated: true})["url"]
      tar_opts = asset.is_gzipped ? 'xzf -' : 'xf -'
      cmds << "RUN curl #{url} | tar #{tar_opts} -C / --no-same-owner --no-same-permissions"
    end
    cmds << ""

    # Generate Docker command for installing apt-packages
    cmds << "# Download app apt-packages"
    if @app.packages.present?
      cmds << "RUN apt-get install --yes #{@app.packages.join(" ")}"
    end
    cmds << ""

    # Generate new token for pfda uploader
    context = @context.as_json.slice("user_id", "username", "token", "expiration", "org_id")
    context["expiration"] = [context["expiration"], Time.now.to_i + 1.day].min
    key = rails_encryptor.encrypt_and_sign({context: context}.to_json)

    # Generate Docker command for running pfda uploader to pull app info
    cmds << "# Download app spec and code"
    cmds << "RUN pfda --auth #{key} download-app-spec --app-id=#{@app.dxid} --output-file=\"/spec.json\""
    cmds << "RUN pfda --auth #{key} download-app-script --app-id=#{@app.dxid} --output-file=\"/script.sh\""
    cmds << ""

    # Add entry point to container
    cmds << "# Set entry point to container"
    cmds << "ENTRYPOINT [\"/usr/bin/run\"]"
    cmds << ""

    dockerfile = cmds.join("\n")    # Join with newlines

    # Download string as Dockerfile
    send_data dockerfile, :type => 'text; charset=utf-8', :disposition => 'attachment', :filename => 'Dockerfile'
  end

  def featured
    org = Org.featured
    if org
      @apps_grid = initialize_grid(AppSeries.accessible_by_public.joins(:user).where(:users => { :org_id => org.id }), {
        name: 'apps',
        order: 'apps.created_at',
        order_direction: 'desc',
        per_page: 100,
        include: [{user: :org}, :latest_version_app]
      })
    end
    render :list
  end

  def explore
    @apps_grid = initialize_grid(AppSeries.accessible_by_public.joins(:latest_version_app), {
      name: 'apps',
      order: 'apps.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [{user: :org}, :latest_version_app]
    })
    render :list
  end

  def show
    @app = App.accessible_by(@context).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    end

    @revisions = @app.app_series.accessible_revisions(@context).select(:title, :id, :dxid, :revision, :version)
    @notes = @app.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @app.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @app.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]

    @items_from_params = [@app]
    @item_path = pathify(@app)
    @item_comments_path = pathify_comments(@app)
    @comments = @app.root_comments.order(id: :desc).page params[:comments_page]

    User.sync_jobs!(@context)

    jobs = @app.app_series.jobs.editable_by(@context)
    @jobs_grid = initialize_grid(jobs, {
      name: 'jobs',
      order: 'jobs.id',
      order_direction: 'desc',
      per_page: 100
    })

    js app: @app.slice(:id, :dxid, :readme)
  end

  def edit
    @app = App.editable_by(@context).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, this app does not exist or is not accessible by you"
      redirect_to apps_path
      return
    else
      if @app.id != @app.app_series.latest_revision_app_id
        redirect_to edit_app_path(@app.app_series.latest_revision_app.dxid)
        return
      else
        js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
      end
    end
  end

  def new
  end

  def fork
    @app = App.accessible_by(@context).find_by(dxid: params[:id])
    if @app.nil?
      flash[:error] = "Sorry, you do not have permissions to fork this app"
      redirect_to apps_path
      return
    else
      js app: @app.slice(:dxid, :name, :title, :version, :revision, :readme, :spec, :internal)
    end
  end
end
