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
    @assets_grid = assets_grid_for(assets)
  end

  def featured
    org = Org.featured
    if org
      assets = Asset.unscoped.accessible_by(@context).joins(:user).where(:users => { :org_id => org.id })
      @assets_grid = assets_grid_for(assets)
    end
    render :index
  end

  def explore
    assets = Asset.unscoped.accessible_by_public
    @assets_grid = assets_grid_for(assets)
    render :index
  end

  def new
  end

  def show
    @asset = Asset.accessible_by(@context).includes(:archive_entries).find_by_uid!(params[:id])

    # Refresh state of asset, if needed
    if @asset.state != "closed"
      User.sync_asset!(@context, @asset.id)
      @asset.reload
    end

    @items_from_params = [@asset]
    @item_path = pathify(@asset)
    @item_comments_path = pathify_comments(@asset)
    if @asset.in_space?
      space = item_from_uid(@asset.scope)
      @comments = Comment.where(commentable: space, content_object: @asset).order(id: :desc).page params[:comments_page]
    else
      @comments = @asset.root_comments.order(id: :desc).page params[:comments_page]
    end

    @notes = @asset.notes.real_notes.accessible_by(@context).order(id: :desc).page params[:notes_page]
    @answers = @asset.notes.accessible_by(@context).answers.order(id: :desc).page params[:answers_page]
    @discussions = @asset.notes.accessible_by(@context).discussions.order(id: :desc).page params[:discussions_page]

    if @asset.editable_by?(@context)
      @licenses = License.editable_by(@context)
    end

    js asset: @asset.slice(:id, :description), license: @asset.license ? @asset.license.slice(:uid, :content) : nil
  end

  def edit
    @asset = Asset.includes(:archive_entries).find_by_uid!(params[:id])
    redirect_to asset_path(@asset) unless @asset.editable_by?(@context)

    js asset: @asset.slice(:id, :description)
  end

  def rename
    @asset = Asset.find_by_uid!(params[:id])
    redirect_to asset_path(@asset) unless @asset.editable_by?(@context)

    title = asset_params[:title]
    if title.is_a?(String) && title != ""
      name = title + @asset.suffix
      description = asset_params[:description] || @asset.description
      if @asset.rename(name, description, @context)
        @asset.reload
        flash[:success] = "Asset renamed to \"#{@asset.name}\""
      else
        flash[:error] = "Asset \"#{@asset.name}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to asset_path(@asset)
  end

  def update
    @asset = Asset.includes(:archive_entries).find_by_uid!(params[:id])
    redirect_to asset_path(@asset) unless @asset.editable_by?(@context)

    Asset.transaction do
      @asset.reload
      if @asset.update(asset_params)
        # Handle a successful update.
        flash[:success] = "Asset updated"
        redirect_to asset_path(@asset)
      else
        flash[:error] = "Error: Could not update the asset. Please try again."
        render 'edit'
      end
    end
  end

  def destroy
    @file = Asset.find_by_uid!(params[:id])
    redirect_to asset_path(@file) unless @file.editable_by?(@context)

    UserFile.transaction do
      @file.reload

      if @file.license.present? && !@file.apps.empty?
        flash[:error] = "This asset contains a license, and has been included in one or more apps. Deleting it would render the license inaccessible to these apps, breaking reproducibility. You can either first remove the license (allowing these existing apps to run without requiring a license) or contact the precisionFDA team to discuss other options."
        redirect_to asset_path(@file)
        return
      end
      @file.destroy
    end

    DNAnexusAPI.new(@context.token).call(@file.project, "removeObjects", objects: [@file.dxid])

    flash[:success] = "Asset \"#{@file.prefix}\" has been successfully deleted"
    redirect_to assets_path
  end

  private

  def asset_params
    params.require(:asset).permit(:description, :title)
  end

  def assets_grid_for(assets)
    initialize_grid(assets.includes(:taggings),{
      name: "assets",
      order: "name",
      order_direction: "asc",
      per_page: 100,
      include: [:user, { user: :org }, { taggings: :tag }]
    })
  end
end
