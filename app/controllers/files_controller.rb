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

    user_files = UserFile.real_files.editable_by(@context)
    @files_grid = initialize_grid(user_files,{
      name: 'files',
      order: 'user_files.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}]
    })
  end

  def featured
    org = Org.featured
    if org
      user_files = UserFile.real_files.accessible_by(@context).joins(:user).where(:users => { :org_id => org.id })

      @files_grid = initialize_grid(user_files,{
        name: 'files',
        order: 'user_files.created_at',
        order_direction: 'desc',
        per_page: 100,
        include: [:user, {user: :org}]
      })
    end
    render :index
  end

  def explore
    user_files = UserFile.real_files.accessible_by_public
    @files_grid = initialize_grid(user_files,{
      name: 'files',
      order: 'user_files.created_at',
      order_direction: 'desc',
      per_page: 100,
      include: [:user, {user: :org}]
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

      @comparisons_grid = initialize_grid(@file.comparisons.accessible_by(@context), {
        name: 'comparisons',
        order: 'comparisons.id',
        order_direction: 'desc',
        per_page: 100,
        include: [:user, {user: :org}]
      })
    else
      @comparison = @file.parent
    end

    @notes = @file.notes.accessible_by(@context).order(id: :desc)

    js id: @file.id
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
    else
      opts = {project: @file.project, preauthenticated: true}
      opts[:filename] = @file.name if params[:inline] != "true"
      redirect_to DNAnexusAPI.new(@context.token).call(@file.dxid, "download", opts)["url"] + (params[:inline] == "true" ? '?inline' : '')
    end
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
      if @file.state == "open"
        user = User.find(@context.user_id)
        user.open_files_count = user.open_files_count - 1
        user.save!
      elsif @file.state == "closing"
        user = User.find(@context.user_id)
        user.closing_files_count = user.closing_files_count - 1
        user.save!
      end
      @file.destroy
    end

    DNAnexusAPI.new(@context.token).call(@file.project, "removeObjects", objects: [@file.dxid])

    flash[:success] = "File \"#{@file.name}\" has been successfully deleted"
    redirect_to files_path
  end
end
