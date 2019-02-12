class SpacesController < ApplicationController

  before_action :init_parent_folder, only: [:files]
  before_action :find_space_and_membership, only: [:show, :discuss, :members, :feed, :tasks, :files, :apps, :notes, :jobs, :assets, :comparisons, :workflows, :reports]
  before_action :content_counters, only: [:feed, :tasks, :files, :apps, :notes, :jobs, :assets, :comparisons, :workflows, :reports]

  layout "space_content", only: [:feed, :tasks, :files, :apps, :notes, :jobs, :assets, :comparisons, :workflows, :reports]

  def index
    spaces = Space.accessible_by(@context)

    @spaces_grid = initialize_grid(spaces, {
      name: 'spaces',
      order: 'spaces.id',
      order_direction: 'desc',
      per_page: 100
    })
  end

  def show
    if @space.review?
      redirect_to feed_space_path(params[:id])
    else
      redirect_to files_space_path(params[:id])
    end
  end

  def discuss
    @associate_with_options = ['Note', 'File', 'App', 'Job', 'Asset', 'Comparison', 'Workflow']
    @items_from_params = [@space]
    @item_path = pathify(@space)
    @item_comments_path = pathify_comments(@space)
    @comments = @space.root_comments.order(id: :desc).page params[:comments_page]
    user_ids = @space.space_memberships.active.map(&:user_id)
    users = User.find(user_ids).map {|u| {name: u.dxuser} }
    space_id = @space.to_param
    js users: users, space_id: space_id, space_uid: @space.uid, scopes: @space.accessible_scopes_for_move
  end

  def search_content
    space = Space.find(params[:id])
    results = space.search_content(params[:content_type], params[:query])
    render json: results
  end

  def members
    @members =
      case params[:filter]
      when 'host', 'reviewer'
        @space.space_memberships.select{ |member| member.side == 'host' }
      when 'guest', 'sponsor'
        @space.space_memberships.select{ |member| member.side == 'guest' }
      else
        @space.space_memberships
      end

    js({ space_uid: @space.uid, scopes: @space.accessible_scopes_for_move, members: @members })
  end

  def verify
    @space = Space.accessible_by(@context).find(params[:id])
    if @space.space_type == 'verification'
      @space.verified = true
      @space.save!
      flash[:success] = "Space verified and locked!"
    end
    # make all apps verified
    apps = App.accessible_by_space(@space)
    app_series = AppSeries.accessible_by_space(@space)
    App.where(id: apps.map(&:id)).update_all(verified: true)
    AppSeries.where(id: app_series.map(&:id)).update_all(verified: true)

    session[:verified] =  @space.id
    redirect_to @space
  end

  def new
    redirect_to spaces_path if !@context.can_create_spaces?
    @space = SpaceForm.new
    js(space_templates: SpaceTemplate.all, space_types: space_types)
  end

  def edit
    @space = editable_space
  end

  def create
    unless @context.can_create_spaces?
      redirect_to spaces_path
      return
    end

    if space_form.valid?
      space = space_form.persist!(@context.api, @context.user)

      if space.accessible_by?(@context)
        flash[:success] = "The space was created successfully, and will be activated once both admin's accept it."
        redirect_to space_path(space)
      else
        flash[:success] = "The space was created successfully, but is not currently accessible by you."
        redirect_to spaces_path
      end
    else
      @space = space_form
      js space_params.merge(space_types: space_types)
      render :new
    end
  end

  def update
    @space = editable_space
    Space.transaction do
      if @space.update(update_space_params)
        # Handle a successful update.
        flash[:success] = "Space updated"
        redirect_to space_path(@space)
      else
        flash[:error] = "Could not update the space. Please try again."
        render :edit
      end
    end
  end

  def destroy
    # TODO: figure out if and how spaces should be deleted
  end

  def accept
    space = Space.accessible_by(@context).find(params[:id])
    admin = space.space_memberships.lead_or_admin.find_by(user_id: @context.user_id)

    if admin
      SpaceService::Accept.call(@context.api, space, admin, @context) unless space.accepted_by?(admin)
    else
      flash[:error] = "You don't have permission to edit this space"
    end
    redirect_to space
  end


  def invite
    @space = Space.accessible_by(@context).find(params[:id])
    admin = fetch_membership

    if admin
      space_invite_form = SpaceInviteForm.new(params[:space].merge(space: @space))

      if space_invite_form.valid?
        space_invite_form.invite(@context, admin)
      else
        flash[:error] = space_invite_form.errors.messages.values.join(", ")
      end
    else
      flash[:error] = "You don't have permission to edit this space"
    end

    redirect_to members_space_path(@space)
  end

  def rename
    @space = editable_space
    name = params[:space][:name]
    if name.is_a?(String) && name != ""
      if @space.rename(name, @context)
        @space.reload
        flash[:success] = "Space renamed to \"#{@space.name}\""
      else
        flash[:error] = "Space \"#{@space.name}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to space_path(@space)
  end

  def rename_folder
    space = Space.accessible_by(@context).find(params[:space_id])
    folder = Folder.accessible_by_space(space).find(params[:file][:id])
    folder_service = FolderService.new(@context)
    result = folder_service.rename(folder, params[:file][:name])
    parent_folder = folder.parent_folder

    if result.success?
      flash[:success] = "Folder successfully renamed to #{result.value.name}"
    else
      flash[:error] = result.value.values
    end

    redirect_target = if parent_folder.present?
                        pathify_folder(parent_folder)
                      else
                        files_space_path(space)
                      end

    redirect_to redirect_target
  end

  def create_folder
    space = Space.accessible_by(@context).find(params[:id])
    parent_folder = Folder.accessible_by_space(space).find_by(id: params[:parent_folder_id])
    service = FolderService.new(@context)
    result = service.add_folder(params[:name], parent_folder, space.uid)

    if result.failure?
      flash[:error] = result.value.values
    else
      flash[:success] = "Folder '#{result.value.name}' successfully created."
    end

    redirect_path = parent_folder.present? ? pathify_folder(parent_folder) : files_space_path(space)
    redirect_to redirect_path
  end

  def move
    space = Space.accessible_by(@context).find(params[:id])
    target_folder_id = params[:target_id] == 'root' ? nil : params[:target_id]
    target_folder = target_folder_id ? Folder.accessible_by_space(space).find_by(id: target_folder_id) : nil
    service = FolderService.new(@context)

    result = service.move(
      Node.where(id: params[:nodes]),
      target_folder,
      space.uid
    )

    if result.success?
      if target_folder.present?
        target_folder_name = target_folder.name
        redirect_path = pathify_folder(target_folder)
      else
        target_folder_name = "root directory"
        redirect_path = files_space_path(space)
      end

      flash[:success] = "Successfully moved #{result.value[:count]} item(s) to #{target_folder_name}"
    else
      current_folder = Folder.accessible_by_space(space).find_by(id: params[:current_folder])
      redirect_path = current_folder.present? ? pathify_folder(current_folder) : files_space_path(space)
      flash[:error] = result.value.values
    end

    redirect_to redirect_path
  end

  # TODO move to api
  skip_before_action :require_login, only: :download_list
  before_action :require_api_login, only: :download_list
  def download_list
    task = params[:task]
    space = Space.accessible_by(@context).find(params[:id])
    root_name = space.name
    files = []

    case task
      when "download"
        nodes = Node.accessible_by_space(space).accessible_by(@context).where(id: params[:ids])
        nodes.each { |node| files += node.is_a?(Folder) ? node.all_files : [node] }
      when "publish"
        nodes = Node.accessible_by_space(space).editable_by(@context).where(id: params[:ids], scope: space.uid)
        nodes.each { |node| files += node.is_a?(Folder) ? node.all_files(Node.where(scope: space.uid)) : [node] }
      when "delete"
        nodes = Node.accessible_by_space(space).editable_by(@context).where(id: params[:ids]).to_a
        files += nodes
        nodes.each { |node| files += node.all_children if node.is_a?(Folder) }
      when "copy_to_cooperative"
        nodes = Node.accessible_by_space(space).editable_by(@context).where(id: params[:ids], scope: space.uid)
        nodes.each { |node| files += node.is_a?(Folder) ? node.all_files(Node.where(scope: space.uid)) : [node] }
    end

    res = files.map do |file|
      info = {
        id: file.id,
        name: file.name,
        type: file.klass,
        fsPath: ([root_name] + file.ancestors(params[:scope]).map(&:name).reverse).compact.join(" / "),
        viewURL: file.is_a?(UserFile) ? file_path(file) : pathify_folder(file)
      }

      info.merge!(downloadURL: download_file_path(file)) if task == "download" && file.is_a?(UserFile)

      info
    end

    render json: res
  end

  def remove_folder
    service = FolderService.new(@context)
    space = Space.accessible_by(@context).find(params[:id])
    files = Node.editable_by(@context).where(id: params[:ids])
    res = service.remove(files)

    if res.success?
      flash[:success] = "Objects(s) successfully removed"
    else
      flash[:error] = res.value.values
    end

    redirect_to files_space_path(space)
  end

  def publish_folder
    space = Space.accessible_by(@context).find(params[:id])
    files = UserFile
              .accessible_by_space(space)
              .editable_by(@context)
              .where(id: params[:ids])

    if files.size == 0
      flash[:error] = "No nodes selected"
      redirect_to files_space_path(space)
      return
    end

    begin
      count = UserFile.publish(files, @context, "public")
    rescue RuntimeError => e
      flash[:error] = e.message
      redirect_to files_space_path(space)
      return
    end

    flash[:success] = "#{count} file(s) successfully published"
    redirect_to files_space_path(space)
  end

  def copy_folder_to_cooperative
    space = Space.accessible_by(@context).find(params[:id])
    files = UserFile
              .accessible_by_space(space)
              .editable_by(@context)
              .where(id: params[:ids])

    shared_space = space.shared_space
    if shared_space
      new_files = files_copy_service.copy(files, shared_space.uid)
    end

    flash[:success] = "#{new_files.count} file(s) successfully copied"
    redirect_to :back
  end

  def copy_to_cooperative
    space = Space.accessible_by(@context).find(params[:id])
    object = item_from_uid(params[:object_id])

    if space && object && space.shared_space

      ActiveRecord::Base.transaction do
        copy_service.copy(object, space.shared_space.uid).each do |new_object|
          SpaceEventService.call(space.shared_space.id, @context.user_id, nil, new_object, "copy_to_cooperative")
        end
      end

      flash[:success] = "#{object.class} successfully copied"
    end

    redirect_to :back
  end

  def copy_service
    @copy_service ||= CopyService.new(api: @context.api, user: @context.user)
  end

  def job
    render 'jobs/show'
  end

  def tasks
    if params[:filter] == "all" && !@context.review_space_admin?
      params[:filter] = "my"
    end

    case params[:filter]
    when "created_by_me"
      filter = {user_id: @context.user_id}
    when "all"
      filter = {}
    else
      params[:filter] = "my"
      filter = {assignee_id: @context.user_id}
    end

    case params[:status]
    when "completed"
      @tasks = @space.tasks.where(filter).completed
      @page_title = 'Completed Tasks'
      @dates_titles = {
        respond: 'RESPONDED ON',
        complete: 'COMPLETED ON'
      }
    when "declined"
      @tasks = @space.tasks.where(filter).declined
      @page_title = 'Declined Tasks'
      @dates_titles = {
        respond: 'RESPOND BY',
        complete: 'DECLINED ON'
      }
    when "accepted"
      @tasks = @space.tasks.where(filter).accepted_and_failed_deadline
      @page_title = 'Active Tasks'
      @dates_titles = {
        respond: 'RESPONDED BY',
        complete: 'COMPLETE BY'
      }
    else
      params[:status] = "awaiting_response"
      @tasks = @space.tasks.where(filter).awaiting_response
      @page_title = 'Awaiting Response Tasks'
      @dates_titles = {
        respond: 'RESPOND BY',
        complete: 'COMPLETE BY'
      }
    end

    @tasks_grid = initialize_grid(@tasks, {
      name: 'tasks',
      order: 'tasks.created_at',
      order_direction: 'desc',
      per_page: 25,
      include: [{user: :org}]
    })

    users = @space.users.map {|u| {label: u.dxuser, value: u.id} }

    if @context.user.can_administer_site?
      user_ids = @space.space_memberships.where(side: @membership.side).pluck(:user_id)
      @group_tasks = @space.tasks.where(user_id: user_ids)
    end

    js({ space_uid: @space.uid, space_id: @space.id, scopes: @space.accessible_scopes_for_move, users: users })
  end

  def notes
    @notes = Note.real_notes.accessible_by_space(@space)
    @notes_list = @notes.order(title: :desc).page params[:notes_page]
    js({ space_uid: @space.uid, scopes: @space.accessible_scopes_for_move })
  end

  def files
    @folder_id = params[:folder_id]
    @folder = Folder.accessible_by_space(@space).find_by(id: @folder_id)
    @folders = folders(@folder_id)

    if request.xhr?
      render_folders(@folders)
      return
    end

    nodes = Node.where.any_of(
      UserFile.real_files.accessible_by_space(@space).where(scoped_parent_folder_id: @folder_id),
      @folders
    )

    @counts.merge!({folders: folders.limit(1).count})

    @files_grid = initialize_grid(nodes.includes(:taggings), {
      name: 'files',
      order: 'name',
      order_direction: 'desc',
      per_page: 25,
      include: [:user, {user: :org}, {taggings: :tag}],
      custom_order: { "nodes.sti_type" => "nodes.sti_type, nodes.name" }
    })
    @scope = @space.uid

    @show_checkboxes = @space.accessible_by?(@context)

    js({ space_uid: @space.uid, scopes: @space.accessible_scopes_for_move, space_id: @space.id }.merge(files_ids_with_descriptions(nodes, @space)))
  end

  def apps
    @apps = AppSeries.accessible_by_space(@space)
    @apps_grid = initialize_grid(@apps.includes(:latest_version_app, :taggings), {
      name: 'apps',
      order: 'apps.title',
      order_direction: 'desc',
      per_page: 25,
      include: [{user: :org}, :latest_version_app, {taggings: :tag}]
    })
    js({ space_uid: @space.uid, scopes: @space.accessible_scopes_for_move })
  end

  def jobs
    @jobs = Job.accessible_by_space(@space)
    @jobs_grid = initialize_grid(@jobs.includes(:taggings), {
      name: 'jobs',
      order: 'jobs.created_at',
      order_direction: 'desc',
      per_page: 25,
      include: [{user: :org}, {taggings: :tag}]
    })
    js({ space_uid: @space.uid, scopes: @space.accessible_scopes_for_move })
  end

  def assets
    @assets = Asset.accessible_by_space(@space)
    @assets_grid = initialize_grid(Asset.unscoped.accessible_by_space(@space).includes(:taggings), {
      name: 'assets',
      order: 'nodes.name',
      order_direction: 'asc',
      per_page: 25,
      include: [:user, {user: :org}, {taggings: :tag}]
    })
    js({ space_uid: @space.uid, scopes: @space.accessible_scopes_for_move })
  end

  def comparisons
    @comparisons = Comparison.accessible_by_space(@space)
    @comparisons_grid = initialize_grid(@comparisons.includes(:taggings), {
      name: 'comparisons',
      order: 'comparisons.name',
      order_direction: 'desc',
      per_page: 25,
      include: [:user, {user: :org}, {taggings: :tag}]
    })
  end

  def workflows
    @workflows = Workflow.accessible_by_space(@space)
    @workflows_grid = initialize_grid(@workflows, {
      name: 'workflows',
      order: 'workflows.name',
      order_direction: 'desc',
      per_page: 25,
      include: [:user, { user: :org }]
    })
  end

  def feed
    if (events = @space.space_events).any?
      @start_date = events.order(created_at: :asc).first.created_at.strftime("%m/%d/%Y")
      @end_date = events.order(created_at: :asc).last.created_at.strftime("%m/%d/%Y")
      @users = User.find(events.pluck(:user_id).uniq).map { |u| { name: u.full_name, value: u.id } }
    else
      @start_date = ""
      @end_date = ""
      @users = []
    end
    @duration = ((Time.now - @space.created_at) / 1.days).ceil
    @roles = SpaceEvent.roles.map { |k, v| {name: k, value: v} }
    @sides = SpaceEvent.sides.map { |k, v| {name: k, value: v} }
    @overall_users = @space.space_memberships.active.count
    object_types = SpaceEvent.object_type_counters(Date.today.beginning_of_week.to_time, Time.now, {space_id: @space.id})
    js({ space_uid: @space.uid, space_id: @space.id, scopes: @space.accessible_scopes_for_move, object_types: object_types })
  end

  def reports
    counters = {}
    counters.merge!(@counts)
    counters[:comments] = Comment.where(commentable: @space).count
    counters[:tasks] = @space.tasks.count
    counters.except!(:feed, :open_tasks, :accepted_tasks, :declined_tasks, :completed_tasks)
    @users = @space.users.map { |user| { name: user.full_name, value: user.id } }
    js( space_uid: @space.uid, space_id: @space.id,
        scopes: @space.accessible_scopes_for_move,
        counts: counters, space_created_at: @space.created_at )
  end

  def apps_and_files
    spaces = Space.where(id: params[:spaces].split(','))

    apps = {}
    files = {}

    spaces.to_a.each do |space|
      apps[space.id] = App.accessible_by_space(space).to_a
      files[space.id] = UserFile.accessible_by_space(space).to_a
    end

    respond_to do |r|
      r.html{ render json: {apps: apps, files: files}}
      r.json{ render json: {apps: apps, files: files}}
    end
  end

  private

  def fetch_membership
    if @context.review_space_admin?
      membership = @space.space_memberships.active.find_by(user_id: @context.user_id)
      membership || SpaceMembership.new_by_admin(@context.user)
    else
      @space.space_memberships.active.find_by!(user_id: @context.user_id)
    end
  end

  def space_params
    p = params.require(:space).permit(:name, :description, :host_lead_dxuser, :guest_lead_dxuser, :space_type, :cts, :sponsor_org_handle, :space_template_id, :restrict_to_template)
    p.require(:name)
    p.require(:space_type)
    return p
  end

  def update_space_params
    params.require(:space).permit(:name, :description, :cts)
  end

  def folders(parent_folder_id = nil)
    Folder.accessible_by_space(@space).where(scoped_parent_folder_id: parent_folder_id)
  end

  def render_folders(folders)
    json_data = folders.map { |folder| render_node(folder) }
    render json: json_data
  end

  def render_node(node)
    {
      foldersPath: node.is_a?(Folder) ? pathify_folder(node) : nil,
      id: node.id,
      name: ERB::Util.h(node.name),
      rename_path: node.is_a?(Folder) ? rename_folder_spaces_path(node) : rename_file_path(node),
      type: node.klass
    }
  end

  def files_ids_with_descriptions(nodes, space)
    {
      filesIdsWithDescription: nodes.select { |file| file.description.present? }.collect(&:id),
      rootName: space.name,
      scope: space.uid,
      nodes: nodes.inject({}) do |memo, node|
        memo[node.id] = render_node(node)
        memo
      end,
      topNodes: folders.inject({}) do |memo, node|
        memo[node.id] = render_node(node)
        memo
      end,
      selectedListURL: download_list_space_path
    }
  end


  def init_parent_folder
    @parent_folder_id = params[:folder_id]
  end

  def editable_space
    space = Space.find(params[:id])
    not_found! unless space.editable_by?(@context)
    space
  end

  def space_form
    @space_form ||= SpaceForm.new(space_params)
  end

  def files_copy_service
    CopyService::FileCopier.new(api: @context.api, user: @context.user)
  end

  def find_space_and_membership
    @space = Space.accessible_by(@context).find_by_id(params[:id])
    unless @space
      redirect_to root_url
      return
    end
    @membership = fetch_membership
  end

  def content_counters
    @counts ||= @space.content_counters(@context.user_id)
  end

  def space_types
    [].tap do |types|
      types << :groups       if @context.can_administer_site?
      types << :review       if @context.review_space_admin?
      types << :verification if @context.review_space_admin?
    end
  end
end
