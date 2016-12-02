class FilesController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show]

  def index
    if @context.guest?
      redirect_to explore_files_path
      return
    end

    # Refresh state of files, if needed
    User.sync_files!(@context)

    user_files = UserFile.real_files.editable_by(@context).includes(:taggings)
    @files_grid = initialize_grid(user_files,{
      name: 'files',
      order: 'user_files.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}, {taggings: :tag}]
    })
  end

  def featured
    org = Org.featured
    if org
      user_files = UserFile.real_files.accessible_by(@context).includes(:user, :taggings).where(:users => { :org_id => org.id })

      @files_grid = initialize_grid(user_files,{
        name: 'files',
        order: 'user_files.created_at',
        order_direction: 'desc',
        per_page: 100,
        include: [:user, {user: :org}, {taggings: :tag}]
      })
    end
    render :index
  end

  def explore
    user_files = UserFile.real_files.accessible_by_public.includes(:taggings)
    @files_grid = initialize_grid(user_files,{
      name: 'files',
      order: 'user_files.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}, {taggings: :tag}]
    })
    render :index
  end

  def show
    @file = UserFile.not_assets.accessible_by(@context).includes(:user).find_by!(dxid: params[:id])

    # Refresh state of file, if needed
    if @file.state != "closed"
      User.sync_file!(@context, @file.id)
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
    @comments = @file.root_comments.order(id: :desc).page params[:comments_page]

    @notes = @file.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @file.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @file.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]
    js file: @file.slice(:uid, :id), license: @file.license ? @file.license.slice(:uid, :content) : nil
  end

  def new
  end

  def download
    # Allow assets as well
    @file = UserFile.accessible_by(@context).find_by!(dxid: params[:id])

    # Refresh state of file, if needed
    if @file.state != "closed"
      if @file.parent_type == "Asset"
        User.sync_asset!(@context, @file.id)
      else
        User.sync_file!(@context, @file.id)
      end
      @file.reload
    end

    if @file.state != "closed"
      flash[:error] = "Files can only be downloaded if they are in the 'closed' state"
      redirect_to file_path(@file.dxid)
    elsif @file.license.present? && !@file.licensed_by?(@context)
      flash[:error] = "You must accept the license before you can download this"
      redirect_to @file.parent_type == "Asset" ? asset_path(@file.dxid) : file_path(@file.dxid)
    else
      opts = {project: @file.project, preauthenticated: true}
      opts[:filename] = @file.name
      redirect_to DNAnexusAPI.new(@context.token).call(@file.dxid, "download", opts)["url"] + (params[:inline] == "true" ? '?inline' : '')
    end
  end

  def link
    # Allow assets as well, thought not currently exposed in the UI
    @file = UserFile.accessible_by(@context).find_by!(dxid: params[:id])

    # Refresh state of file, if needed
    if @file.state != "closed"
      if @file.parent_type == "Asset"
        User.sync_asset!(@context, @file.id)
      else
        User.sync_file!(@context, @file.id)
      end
      @file.reload
    end

    if @file.state != "closed"
      flash[:error] = "Files can only be downloaded if they are in the 'closed' state"
      redirect_to file_path(@file.dxid)
    elsif @file.license.present? && !@file.licensed_by?(@context)
      flash[:error] = "You must accept the license before you can get the download link"
      redirect_to @file.parent_type == "Asset" ? asset_path(@file.dxid) : file_path(@file.dxid)
    else
      opts = {project: @file.project, preauthenticated: true, filename: @file.name, duration: 86400}
      @url = DNAnexusAPI.new(@context.token).call(@file.dxid, "download", opts)["url"]
    end
  end

  def rename
    @file = UserFile.real_files.editable_by(@context).find_by!(dxid: params[:id])
    name = file_params[:name]
    if name.is_a?(String) && name != ""
      if @file.rename(name, @context)
        @file.reload
        flash[:success] = "File renamed to \"#{@file.name}\""
      else
        flash[:error] = "File \"#{@file.name}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to file_path(@file.dxid)
  end

  def destroy
    @file = UserFile.real_files.where(user_id: @context.user_id).find_by!(dxid: params[:id])

    UserFile.transaction do
      @file.reload

      if @file.comparisons.count > 0
        flash[:error] = "This file cannot be deleted because it participates in one or more comparisons. Please delete all the comparisons first."
        redirect_to file_path(@file.dxid)
        return
      end
      @file.destroy
    end

    DNAnexusAPI.new(@context.token).call(@file.project, "removeObjects", objects: [@file.dxid])

    flash[:success] = "File \"#{@file.name}\" has been successfully deleted"
    redirect_to files_path
  end

  private
    def file_params
      params.require(:file).permit(:name)
    end
end
