class AssetsController < ApplicationController
  def index
    # Refresh state of assets, if needed
    User.sync_assets!(@context.user_id, @context.token)

    assets = Asset.accessible_by(@context)
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
  end
end
