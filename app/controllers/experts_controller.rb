class ExpertsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show]
  before_action :require_login_or_guest, only: [:index, :show]

  def index
    @experts = Expert.all
  end

  def new
    redirect_to experts_path unless @context.user.can_administer_site?
    @expert = Expert.new
  end

  def edit
    @expert = Expert.editable_by(@context).find_by!(id: params[:id])
  end

  def update
    @expert = Expert.editable_by(@context).find(params[:id])
    Expert.transaction do
      if @expert.update(update_expert_params)
        flash[:success] = "Expert information updated"
        redirect_to expert_path(@expert)
      else
        flash[:error] = "Could not update expert information. Please try again."
        render :edit
      end
    end
  end

  def create
    redirect_to experts_path unless @context.user.can_administer_site?

    u = User.find_by(dxuser: expert_params[:username])
    if u.nil?
      flash.now[:error] = "Expert username #{expert_params[:username]} not found!"
    else
      e = Expert.provision(@context, expert_params)
      if e
        redirect_to experts_path
        flash[:success] = "A new Expert of the Month was successfully created for #{e.name} (#{e.user.dxuser})."
        return
      else
        flash.now[:error] = "The Expert could not be provisioned because of an unknown reason."
      end
    end

    @expert = Expert.new(expert_params)
    render :new
  end

  def show
    @expert = Expert.find(params[:id])
  end

  def followers
    @discussion = Event.find(params[:id])
    #@followers = @discussion.user_followers
  end

  def rename
    @discussion = Discussion.editable_by(@context).find_by!(id: params[:id])
    title = discussion_params[:title]
    if title.is_a?(String) && title != ""
      if @discussion.rename(title, @context)
        @discussion.reload
        flash[:success] = "Discussion renamed to \"#{@discussion.title}\""
      else
        flash[:error] = "Discussion \"#{@discussion.title}\" could not be renamed."
      end
    else
      flash[:error] = "The new name is not a valid string"
    end

    redirect_to discussion_path(@discussion)
  end

  def destroy
    expert = Event.editable_by(@context).find(params[:id])
    name = expert.name

    expert.destroy

    flash[:success] = "Expert of the Month: \"#{name}\" has been successfully deleted"
    redirect_to :experts
  end

  private
    def expert_params
      p = params.require(:expert).permit(:username, :_intro, :_bio, :image)
      p.require(:username)
      p.require(:_intro)
      p.require(:_bio)
      p.require(:image)
      return p
    end

    def update_expert_params
      p = params.require(:expert).permit(:_intro, :_bio, :image)
      p.require(:_intro)
      p.require(:_bio)
      p.require(:image)
      return p
    end
end
