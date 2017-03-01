class MetaAppathonsController < ApplicationController
  skip_before_action :require_login, {only: [:show]}
  before_action :require_login_or_guest, only: []

  def index
    @meta_appathons = MetaAppathon.all.page params[:meta_appathons_page]
  end

  def show
    if !params[:id].nil?
      @meta_appathon = MetaAppathon.find(params[:id])
      if @meta_appathon.handle == ACTIVE_META_APPATHON
        redirect_to active_meta_appathon_path and return
      end
    else
      @meta_appathon = MetaAppathon.active
    end
    @appathons = @meta_appathon.appathons.order(name: :asc)

    @apps = @meta_appathon.apps.sort_by {|app| app.updated_at }.reverse

    @reactions = [
      {
        vote_scope: "#{@meta_appathon.uid}-love",
        icon: "fa fa-fw fa-heart-o",
        title: "I love this app"
      },
      {
        vote_scope: "#{@meta_appathon.uid}-idea",
        icon: "fa fa-fw fa-lightbulb-o",
        title: "I think it's innovative"
      },
      {
        vote_scope: "#{@meta_appathon.uid}-time",
        icon: "fa fa-fw fa-bolt",
        title: "It's a fast/efficient algorithm"
      },
      {
        vote_scope: "#{@meta_appathon.uid}-documentation",
        icon: "fa fa-fw fa-file-text-o",
        title: "Looks well-documented"
      }
    ]

    if @context.logged_in?
      @user_appathon = @context.user.appathon_from_meta(@meta_appathon)
    end
    if !@meta_appathon.template.blank?
      render template: "meta_appathons/templates/#{@meta_appathon.template}"
    end
  end

  def new
    redirect_to meta_appathons_path unless @context.user.can_administer_site?
    @meta_appathon = MetaAppathon.new
  end

  def edit
    @meta_appathon = MetaAppathon.editable_by(@context).find_by(id: params[:id])
    redirect_to meta_appathon_path(params[:id]) if @meta_appathon.nil?
  end

  def create
    if @context.user.can_administer_site? && request.post?
      meta_appathon_params[:handle] = meta_appathon_params[:handle].parameterize
      @meta_appathon = MetaAppathon.create!(meta_appathon_params)
      if @meta_appathon.persisted?
        redirect_to @meta_appathon
        return
      else
        flash[:error] = "The meta appathon could not be provisioned for an unknown reason."
        render :new
      end
    else
      redirect_to meta_appathons_path
    end
  end

  def update
    @meta_appathon = MetaAppathon.editable_by(@context).find_by(id: params[:id])
    redirect_to meta_appathon_path(params[:id]) if @meta_appathon.nil?

    MetaAppathon.transaction do
      if @meta_appathon.update(meta_appathon_params)
        # Handle a successful update.
        flash[:success] = "Meta Appathon updated"
        redirect_to meta_appathon_path(@meta_appathon)
      else
        flash[:error] = "Could not update the meta appathon. Please try again."
        render :edit
      end
    end
  end

  private
  def meta_appathon_params
    p = params.require(:meta_appathon).permit(:name, :description, :handle, :template, :start_at, :end_at)
    p.require(:name)
    p.require(:handle)
    p.require(:start_at)
    p.require(:end_at)
    return p
  end
end
