class FilesController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore]
  before_action :require_login_or_guest, only: [:index, :featured, :explore]
  before_action :redirect_guest,         only: [:index]
  before_action :init_parent_folder,     only: [:index, :featured, :explore]

  include VerifiedSpaceHelper

  def index
    if request.xhr?
      render_folders(private_folders(@parent_folder_id))
      return
    end

    # Refresh state of files, if needed
    User.sync_files!(@context)

    files = UserFile
              .real_files
              .editable_by(@context)
              .where(parent_folder_id: @parent_folder_id)
              .includes(:taggings)

    folders = private_folders(@parent_folder_id).includes(:taggings)
    user_files = Node.where.any_of(files, folders)

    @current_folder = Folder.private_for(@context).editable_by(@context).find_by(id: @parent_folder_id)
    @files_grid = files_grid(user_files)
    @edit_access_present = true
    @new_folder_is_public = false
    @scope = "private"
    js files_ids_with_descriptions(
         user_files,
         private_folders,
         @scope
       )
  end

  def featured
    org = Org.featured

    if org
      user_files =
        UserFile.real_files
          .accessible_by(@context)
          .includes(:user, :taggings)
          .where(user: User.real.where(org: org))

      @files_grid = files_grid(user_files)
      @new_folder_is_public = false
      js :index, files_ids_with_descriptions(user_files, [], "featured")
    end

    render :index
  end

  def explore
    if request.xhr?
      render_folders(explore_folders(@parent_folder_id))
      return
    end

    files = UserFile
              .real_files
              .accessible_by_public
              .includes(:taggings)
              .where(scoped_parent_folder_id: @parent_folder_id)

    folders = explore_folders(@parent_folder_id).includes(:taggings)
    user_files = Node.where.any_of(files, folders)

    @current_folder = Folder.accessible_by_public.find_by(id: @parent_folder_id)
    @files_grid = files_grid(user_files)
    @new_folder_is_public = true
    @scope = "public"
    @edit_access_present = @context.can_administer_site?

    js :index, files_ids_with_descriptions(
      user_files,
      explore_folders,
      @scope
    )
    render :index
  end

  def show
    @file = UserFile.not_assets.accessible_by(@context).includes(:user).find_by_uid!(params[:id])

    # Refresh state of file, if needed
    if @file.state != "closed"
      @file.is_submission_output? ? User.sync_challenge_file!(@file.id) : User.sync_file!(@context, @file.id)
      @file.reload
    end

    if @file.parent_type != "Comparison"
      User.sync_comparisons!(@context)

      @comparisons_grid = initialize_grid(@file.comparisons.accessible_by(@context).includes(:taggings), {
        name: 'comparisons',
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 100,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    else
      @comparison = @file.parent
    end

    if @file.editable_by?(@context)
      @licenses = License.editable_by(@context)
    end

    @items_from_params = [@file]
    @item_path = pathify(@file)
    @item_comments_path = pathify_comments(@file)
    if @file.in_space?
      space = item_from_uid(@file.scope)
      @comments = Comment.where(commentable: space, content_object: @file).order(id: :desc).page params[:comments_page]
    else
      @comments = @file.root_comments.order(id: :desc).page params[:comments_page]
    end

    @notes = @file.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @file.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @file.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]
    js file: @file.slice(:uid, :id), license: @file.license ? @file.license.slice(:uid, :content) : nil
  end

  def new
    js folder_id: params[:folder_id]
  end

  def download
    # Allow assets as well
    @file = UserFile.accessible_by(@context).find_by_uid!(params[:id])

    # Refresh state of file, if needed
    if @file.state != "closed"
      if @file.parent_type == "Asset"
        User.sync_asset!(@context, @file.id)
      else
        @file.is_submission_output? ? User.sync_challenge_file!(@file.id) : User.sync_file!(@context, @file.id)
      end
      @file.reload
    end

    if @file.state != "closed"
      flash[:error] = "Files can only be downloaded if they are in the 'closed' state"
      redirect_to file_path(@file)
    elsif @file.license.present? && !@file.licensed_by?(@context)
      flash[:error] = "You must accept the license before you can download this"
      redirect_to @file.parent_type == "Asset" ? asset_path(@file) : file_path(@file)
    else
      opts = {project: @file.project, preauthenticated: true}
      opts[:filename] = @file.name
      file_url = DNAnexusAPI.new(@file.is_submission_output? ? CHALLENGE_BOT_TOKEN : @context.token).call(@file.dxid, "download", opts)["url"] + (params[:inline] == "true" ? '?inline' : '')
      Event::FileDownloaded.create_for(@file, @context.user)
      redirect_to file_url
    end
  end

  def link
    # Allow assets as well, thought not currently exposed in the UI
    @file = UserFile.accessible_by(@context).find_by_uid!(params[:id])

    # Refresh state of file, if needed
    if @file.state != "closed"
      if @file.parent_type == "Asset"
        User.sync_asset!(@context, @file.id)
      else
        @file.is_submission_output? ? User.sync_challenge_file!(@file.id) : User.sync_file!(@context, @file.id)
      end
      @file.reload
    end

    if @file.state != "closed"
      flash[:error] = "Files can only be downloaded if they are in the 'closed' state"
      redirect_to file_path(@file)
    elsif @file.license.present? && !@file.licensed_by?(@context)
      flash[:error] = "You must accept the license before you can get the download link"
      redirect_to @file.parent_type == "Asset" ? asset_path(@file) : file_path(@file)
    else
      opts = {project: @file.project, preauthenticated: true, filename: @file.name, duration: 86400}
      @url = DNAnexusAPI.new(@file.is_submission_output? ? CHALLENGE_BOT_TOKEN : @context.token).call(@file.dxid, "download", opts)["url"]
      Event::FileDownloaded.create_for(@file, @context.user)
    end
  end

  def rename
    @file = UserFile.real_files.find_by_uid(params[:id])

    unless @file.present?
      flash[:error] = "File not found"
      redirect_to files_path
      return
    end

    description = file_params.key?(:description) ? file_params[:description] : @file.description
    parent_folder = @file.parent_folder(params[:scope])

    redirect_target = if params[:source] == "list"
                        if parent_folder.present?
                          pathify_folder(parent_folder)
                        else
                          if @file.in_space?
                            files_space_path(Space.from_scope(@file.scope))
                          elsif params[:scope] == "public"
                            explore_files_path
                          else
                            files_path
                          end
                        end
                      else
                        file_path(@file)
                      end

    unless @file.editable_by?(@context)
      flash[:error] = "You have no permissions to edit this file."
      redirect_to redirect_target
      return
    end

    if @file.rename(file_params[:name], description, @context)
      flash[:success] = "File info successfully updated."
    else
      flash[:error] = @file.errors.messages.values.flatten
    end

    redirect_to redirect_target
  end

  def destroy
    @file = UserFile.real_files.find_by_uid!(params[:id])

    unless @file.editable_by?(@context)
      redirect_to file_path, alert: "You have no permissions to delete this file."
      return
    end

    service = FolderService.new(@context)

    res = service.remove([@file])

    if res.success?
      flash[:success] = "File \"#{@file.name}\" has been successfully deleted"
      redirect_path = files_path
    else
      flash[:error] = res.value.values.first
      redirect_path = file_path(@file)
    end

    redirect_to redirect_path
  end

  def create_folder
    is_public_folder = params[:public] == "true"

    if is_public_folder
      if @context.user.can_administer_site?
        parent_folder = Folder.accessible_by_public.find_by(id: params[:parent_folder_id])
        scope = "public"
      else
        flash[:error] = "You are not allowed to create public folders"
        redirect_to explore_files_path
        return
      end
    else
      parent_folder = Folder.editable_by(@context).find_by(id: params[:parent_folder_id])
      scope = "private"
    end

    service = FolderService.new(@context)
    result = service.add_folder(params[:name], parent_folder, scope)

    if result.failure?
      flash[:error] = result.value.values
    else
      flash[:success] = "Folder '#{result.value.name}' successfully created."
    end

    redirect_target = if parent_folder.present?
                        pathify_folder(parent_folder)
                      else
                        scope == "public" ? explore_files_path : files_path
                      end

    redirect_to redirect_target
  end

  def rename_folder
    folder = Folder.editable_by(@context).find(params[:id])
    folder_service = FolderService.new(@context)
    result = folder_service.rename(folder, file_params[:name])
    parent_folder = folder.parent_folder

    if result.success?
      flash[:success] = "Folder successfully renamed to #{result.value.name}"
    else
      flash[:error] = result.value.values
    end

    redirect_target = if parent_folder.present?
                        pathify_folder(parent_folder)
                      else
                        folder.public? ? explore_files_path : files_path
                      end

    redirect_to redirect_target
  end

  def move
    target_folder_id = params[:target_id] == 'root' ? nil : params[:target_id]
    target_folder = target_folder_id ? Folder.editable_by(@context).find(target_folder_id) : nil
    service = FolderService.new(@context)

    result = service.move(
      Node.where(id: params[:nodes]),
      target_folder,
      params[:scope]
    )

    if result.success?
      target_folder_name = target_folder.present? ? target_folder.name : "root directory"
      flash[:success] = "Successfully moved #{result.value[:count]} item(s) to #{target_folder_name}"
    else
      flash[:error] = result.value.values
    end

    redirect_target = if target_folder.present?
                        pathify_folder(target_folder)
                      else
                        result.value[:scope] == "public" ? explore_files_path : files_path
                      end

    redirect_to redirect_target
  end

  # TODO move to api
  skip_before_action :require_login, only: :download_list
  before_action :require_api_login, only: :download_list
  def download_list
    task = params[:task]
    files = []

    case task
      when "download"
        nodes = Node.accessible_by(@context).where(id: params[:ids])
        nodes.each { |node| files += node.is_a?(Folder) ? node.all_files : [node] }
      when "publish"
        nodes = Node.editable_by(@context).where(id: params[:ids]).where.not(scope: "public")
        nodes.each { |node| files += node.is_a?(Folder) ? node.all_files(Node.where.not(scope: "public")) : [node] }
      when "delete"
        nodes = Node.editable_by(@context).where(id: params[:ids]).to_a
        files += nodes
        nodes.each { |node| files += node.all_children if node.is_a?(Folder) }
    end

    root_name = determine_scope_name(params[:scope])

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

  def remove
    service = FolderService.new(@context)
    files = Node.editable_by(@context).where(id: params[:ids])
    res = service.remove(files)

    if res.success?
      flash[:success] = "Node(s) successfully removed"
    else
      flash[:error] = res.value.values
    end

    redirect_path = params[:scope] == "public" ? explore_files_path : files_path
    redirect_to redirect_path
  end

  def publish
    files = UserFile.editable_by(@context).where(id: params[:ids], scope: "private")

    begin
      count = UserFile.publish(files, @context, "public")
    rescue RuntimeError => e
      flash[:error] = e.message
      redirect_to files_path
      return
    end

    flash[:success] = "#{count} file(s) successfully published"
    redirect_to files_path
  end

  private

  def determine_scope_name(scope)
    case scope
      when "private"
        "My files"
      when "public"
        "Explore"
      when "featured"
        "Featured"
      else
        nil
    end
  end

  def private_folders(parent_folder_id = nil)
    Folder
      .private_for(@context)
      .editable_by(@context)
      .where(parent_folder_id: parent_folder_id)
  end

  def explore_folders(parent_folder_id = nil)
    Folder
      .accessible_by_public
      .where(scoped_parent_folder_id: parent_folder_id)
  end

  def render_folders(folders)
    json_data = folders.map { |folder| render_node(folder) }
    render json: json_data
  end

  def render_node(node)
    {
      id: node.id,
      foldersPath: node.is_a?(Folder) ? pathify_folder(node) : nil,
      name: ERB::Util.h(node.name),
      rename_path: node.is_a?(Folder) ? rename_folder_file_path(node) : rename_file_path(node),
      type: node.klass,
      in_verified_space: in_verified_space?(node)
    }
  end


  def file_params
    params.require(:file).permit(:name, :description)
  end

  def files_ids_with_descriptions(nodes, top_nodes, scope)
    {
      filesIdsWithDescription: nodes.select { |file| file.description.present? }.collect(&:id),
      rootName: determine_scope_name(scope),
      scope: scope,
      nodes: nodes.inject({}) do |memo, node|
        memo[node.id] = render_node(node)
        memo
      end,
      topNodes: top_nodes.inject({}) do |memo, node|
        memo[node.id] = render_node(node)
        memo
      end,
      selectedListURL: download_list_files_path
    }
  end

  def redirect_guest
    redirect_to explore_files_path if @context.guest?
  end

  def files_grid(relation)
    initialize_grid(relation, {
      name: 'files',
      order: 'created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, { user: :org }, { taggings: :tag }],
      custom_order: { "nodes.sti_type" => "nodes.sti_type, nodes.name" }
    })
  end

  def init_parent_folder
    @parent_folder_id = params[:folder_id]
  end

end
