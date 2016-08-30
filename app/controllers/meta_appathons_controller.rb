class MetaAppathonsController < ApplicationController

  def index
    @meta_appathons = MetaAppathon.all.page params[:meta_appathons_page]
  end

  def show
    @meta_appathon = MetaAppathon.find(params[:id])
    @appathons = @meta_appathon.appathons.page params[:appathons_page]

    custom_templates = ["appathon_in_a_box"]
    if custom_templates.include?(@meta_appathon.handle)
      render template: "meta_appathons/handles/#{@meta_appathon.handle}"
    end
  end

  def new
    redirect_to meta_appathons_path unless @context.user.can_administer_site?
    @meta_appathon = MetaAppathon.new
  end

  def edit
    @meta_appathon = MetaAppathon.editable_by(@context).find(params[:id])
    redirect_to meta_appathon_path(params[:id]) if @meta_appathon.nil?
  end

  def create
    redirect_to meta_appathons_path unless @context.user.can_administer_site?

    if request.post?
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
      redirect_to appathons_path
    end
  end

  def update
    @meta_appathon = MetaAppathon.editable_by(@context).find(params[:id])
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

  def rename
    @meta_appathon = MetaAppathon.editable_by(@context).find_by(id: params[:id])
    name = meta_appathon_params[:name]
    if name.is_a?(String) && name.present?
      if @meta_appathon.rename(name, @context)
        @meta_appathon.reload
        flash[:success] = "Meta Appathon renamed to \"#{@meta_appathon.name}\""
      else
        flash[:error] = "Meta Appathon \"#{@meta_appathon.name}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to meta_appathon_path(@meta_appathon)
  end

  private
  def meta_appathon_params
    p = params.require(:meta_appathon).permit(:name, :description, :handle, :start_at, :end_at)
    p.require(:name)
    p.require(:handle)
    p.require(:start_at)
    p.require(:end_at)
    return p
  end
end
