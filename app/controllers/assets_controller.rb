class AssetsController < ApplicationController
  def index
    # Refresh state of assets, if needed
    User.sync_assets!(@context.user_id, @context.token)

    # Wice seems to not like the default_scope of Asset
    assets = Asset.unscoped.accessible_by(@context)
    @assets_grid = initialize_grid(assets,{
      include: [:user],
      order: 'user_files.id',
      order_direction: 'desc',
      per_page: 100
    })
  end

  def show
    @asset = Asset.accessible_by(@context).includes(:archive_entries).find_by!(dxid: params[:id])

    # Refresh state of asset, if needed
    if @asset.state != "closed"
      User.sync_asset!(@context.user_id, @asset.id, @context.token)
      @asset.reload
    end

    js asset: @asset.slice(:description)
  end

  def destroy
    @file = Asset.where(user_id: @context.user_id).find_by!(dxid: params[:id])

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
end
