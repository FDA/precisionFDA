class AppathonsController < ApplicationController

  def index
    @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])

    @appathons = @meta_appathon.appathons.page params[:appathons_page]
  end

  def show
    @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])

    @appathon = Appathon.find_by(id: params[:id], meta_appathon_id: params[:meta_appathon_id])

    @apps = @appathon.apps

    @items_from_params = [@meta_appathon, @appathon]
    @item_comments_path = pathify_comments(@appathon)
    @comments = @appathon.root_comments.order(id: :desc).page params[:comments_page]
    @commentable = @appathon

    redirect_to meta_appathons_appathons_path(@meta_appathon) if @appathon.nil?
  end

  def new
    @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])

    @appathon = Appathon.new({
      meta_appathon_id: @meta_appathon_id,
      start_at: @meta_appathon.start_at,
      end_at: @meta_appathon.end_at
    })
  end

  def edit
    @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])

    @appathon = Appathon.editable_by(@context).find_by(id: params[:id], meta_appathon_id: params[:meta_appathon_id])
    if @appathon.nil?
      flash[:error] = "You do not have permission to edit this appathon"
      redirect_to meta_appathons_appathon_path(@meta_appathon, params[:id])
    end
  end

  def create
    @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])
    if @meta_appathon.followed_by?(@context.user)
      redirect_to meta_appathons_path
      return
    end

    p = appathon_params
    p[:meta_appathon_id] = @meta_appathon.id
    p[:admin_id] = @context.user_id
    # TODO: check if start/end are between meta_appathon constraints
    # Note: fix start_at after it passes
    # p[:start_at] = @meta_appathon.start_at
    # Note: end_at can extend
    # p[:end_at] = @meta_appathon.end_at
    @appathon = Appathon.new(p)
    Appathon.transaction do
      # Check again user not in any appathon
      @meta_appathon.reload
      if !@meta_appathon.followed_by?(@context.user)
        @appathon.save
        if @appathon.persisted?
          @context.user.follow(@appathon)
          @context.user.follow(@meta_appathon)
        end
      end
    end

    if @appathon.persisted?
      redirect_to meta_appathon_appathon_path(@meta_appathon, @appathon)
      return
    end

    flash[:error] = "The appathon could not be provisioned for an unknown reason."
    render :new
  end

  def update
    @appathon = Appathon.editable_by(@context).find_by(id: params[:id], meta_appathon_id: params[:meta_appathon_id])
    redirect_to meta_appathon_appathon_path(params[:meta_appathon_id], params[:id]) if @appathon.nil?

    Appathon.transaction do
      if @appathon.update(appathon_params)
        # Handle a successful update.
        flash[:success] = "Appathon updated"
        redirect_to meta_appathon_appathon_path(@appathon.meta_appathon, @appathon)
      else
        flash[:error] = "Could not update the appathon. Please try again."
        render :edit
      end
    end
  end

  def join
    @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])
    return meta_appathons_path unless @meta_appathon

    @appathon = Appathon.find_by(id: params[:id], meta_appathon_id: params[:meta_appathon_id])
    redirect_to meta_appathons_appathons_path(@meta_appathon) if @appathon.nil?

    if @context.logged_in?
      Appathon.transaction do
        @meta_appathon.reload
        if !@meta_appathon.followed_by?(@context.user)
          @context.user.follow(@appathon)
          @context.user.follow(@meta_appathon)
          flash[:success] = "You have joined the Appathon! Get started by writing and publishing an app."
        else
          flash[:error] = "You can only belong to one appathon at a time."
        end
      end
      redirect_to meta_appathon_appathon_path(@meta_appathon, @appathon)
    else
      flash[:alert] = "You need to log in or request access before participating in the appathon."
      redirect_to request_access_path
    end
  end

  def rename
    @appathon = Appathon.editable_by(@context).find_by(id: params[:id], meta_appathon_id: params[:meta_appathon_id])
    name = params[:appathon][:title]
    if name.is_a?(String) && name != ""
      if @appathon.rename(name, @context)
        @appathon.reload
        flash[:success] = "Appathon renamed to \"#{@appathon.name}\""
      else
        flash[:error] = "Appathon \"#{@appathon.name}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to meta_appathon_appathon_path(@appathon.meta_appathon, @appathon)
  end

  private
  def appathon_params
    p = params.require(:appathon).permit(:name, :description, :start_at, :end_at)
    p.require(:name)
    # p.require(:flag)
    return p
  end
end
