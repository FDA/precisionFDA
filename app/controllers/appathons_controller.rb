class AppathonsController < ApplicationController
  skip_before_action :require_login, {only: [:show]}
  before_action :require_login_or_guest, only: []

  def index
    @meta_appathon = MetaAppathon.active

    @appathons = @meta_appathon.appathons.page params[:appathons_page]
  end

  def show
    @appathon = Appathon.find(params[:id])
    @meta_appathon = @appathon.meta_appathon

    @apps = @appathon.apps

    @items_from_params = [@appathon]
    @item_comments_path = pathify_comments(@appathon)
    @comments = @appathon.root_comments.order(id: :desc).page params[:comments_page]
    @commentable = @appathon
  end

  def new
    if !params[:meta_appathon_id].nil?
      @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])
    else
      @meta_appathon = MetaAppathon.active
    end
    @appathon = Appathon.new({
      meta_appathon_id: @meta_appathon.id,
      start_at: @meta_appathon.start_at,
      end_at: @meta_appathon.end_at
    })
  end

  def edit
    @appathon = Appathon.editable_by(@context).find_by(id: params[:id])
    @meta_appathon = @appathon.meta_appathon
    if @appathon.nil?
      flash[:error] = "You do not have permission to edit this appathon"
      redirect_to appathon_path(params[:id])
    end
  end

  def create
    if !params[:meta_appathon_id].nil?
      @meta_appathon = MetaAppathon.find(params[:meta_appathon_id])
    else
      @meta_appathon = MetaAppathon.active
    end
    if @meta_appathon.followed_by?(@context.user)
      redirect_to meta_appathon_path(@meta_appathon)
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
      redirect_to appathon_path(@appathon)
      return
    end

    flash[:error] = "The appathon could not be provisioned for an unknown reason."
    render :new
  end

  def update
    @appathon = Appathon.editable_by(@context).find_by(id: params[:id])
    redirect_to appathon_path(params[:id]) if @appathon.nil?

    Appathon.transaction do
      if @appathon.update(appathon_params)
        # Handle a successful update.
        flash[:success] = "Appathon updated"
        redirect_to appathon_path(@appathon)
      else
        flash[:error] = "Could not update the appathon. Please try again."
        render :edit
      end
    end
  end

  def join
    @appathon = Appathon.find_by(id: params[:id])
    redirect_to meta_appathon_path(MetaAppathon.active) if @appathon.nil?

    @meta_appathon = @appathon.meta_appathon

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
      redirect_to appathon_path(@appathon)
    else
      flash[:alert] = "You need to log in or request access before participating in the appathon."
      redirect_to request_access_path
    end
  end

  private
  def appathon_params
    p = params.require(:appathon).permit(:name, :description, :location, :flag, :start_at, :end_at)
    p.require(:name)
    p.require(:flag)
    p.require(:location)
    p.require(:start_at)
    p.require(:end_at)
    return p
  end
end
