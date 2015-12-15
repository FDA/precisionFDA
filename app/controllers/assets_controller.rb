class AssetsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :featured, :explore, :show, :new]
  before_action :require_login_or_guest, only: [:index, :featured, :explore, :show, :new]
  def index
    if @context.guest?
      redirect_to explore_assets_path
      return
    end

    # Refresh state of assets, if needed
    User.sync_assets!(@context)

    # Wice seems to not like the default_scope of Asset
    assets = Asset.unscoped.editable_by(@context)
    @assets_grid = initialize_grid(assets,{
      name: 'assets',
      order: 'user_files.name',
      order_direction: 'asc',
      per_page: 100,
      include: [:user, {user: :org}]
    })
  end

  def featured
    org = Org.featured
    if org
      assets = Asset.unscoped.accessible_by(@context).joins(:user).where(:users => { :org_id => org.id })

      @assets_grid = initialize_grid(assets,{
        name: 'assets',
        order: 'user_files.name',
        order_direction: 'asc',
        per_page: 100,
        include: [:user, {user: :org}]
      })
    end
    render :index
  end

  def explore
    assets = Asset.unscoped.accessible_by_public
    @assets_grid = initialize_grid(assets,{
      name: 'assets',
      order: 'user_files.name',
      order_direction: 'asc',
      per_page: 100,
      include: [:user, {user: :org}]
    })
    render :index
  end

  def new
  end

  def show
    @asset = Asset.accessible_by(@context).includes(:archive_entries).find_by!(dxid: params[:id])

    # Refresh state of asset, if needed
    if @asset.state != "closed"
      User.sync_asset!(@context, @asset.id)
      @asset.reload
    end

    @notes = @asset.notes.accessible_by(@context).order(id: :desc)

    js asset: @asset.slice(:uid, :id, :description)
  end

  def edit
    @asset = Asset.editable_by(@context).includes(:archive_entries).find_by!(dxid: params[:id])

    js asset: @asset.slice(:uid, :id, :description)
  end

  def update
    @asset = Asset.editable_by(@context).includes(:archive_entries).find_by!(dxid: params[:id])

    if @asset.update_attributes(asset_params)
      # Handle a successful update.
      flash[:success] = "Asset updated"
      redirect_to asset_path(@asset.dxid)
    else
      flash[:error] = "Error: Could not update the asset. Please try again."
      render 'edit'
    end
  end

  def destroy
    @file = Asset.editable_by(@context).find_by!(dxid: params[:id])

    UserFile.transaction do
      @file.reload

      if @file.state == "open"
        user = User.find(@context.user_id)
        user.open_assets_count = user.open_assets_count - 1
        user.save!
      elsif @file.state == "closing"
        user = User.find(@context.user_id)
        user.closing_assets_count = user.closing_assets_count - 1
        user.save!
      end
      @file.destroy
    end

    DNAnexusAPI.new(@context.token).call(@file.project, "removeObjects", objects: [@file.dxid])

    flash[:success] = "Asset \"#{@file.prefix}\" has been successfully deleted"
    redirect_to assets_path
  end

  private

  def asset_params
    params.require(:asset).permit(:description)
  end
end
