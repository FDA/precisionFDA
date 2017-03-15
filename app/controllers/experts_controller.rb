class ExpertsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show, :ask_question]
  before_action :require_login_or_guest, only: [:edit, :update, :create, :new]

  def index
    @experts = Expert.all.order(id: :desc)
  end

  def new
    redirect_to experts_path unless @context.logged_in? && @context.user.can_administer_site?
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

  def ask_question
    @expert = Expert.find(params[:id])
    q = ExpertQuestion.provision(@expert, @context, params[:expert][:question])
    if q
      flash[:success] = "Your question was submitted successfully."
    else
      flash.now[:error] = "Your question was not submitted because of an unknown reason."
    end
    redirect_to expert_path(@expert)
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

  def dashboard
    @expert = Expert.find(params[:id])
    redirect_to experts_path unless @expert.editable_by?(@context)

    @answered_questions = @expert.answered_questions
    @ignored_questions = @expert.ignored_questions
    @open_questions = @expert.open_questions
    @total_count = @answered_questions.count + @ignored_questions.count + @open_questions.count
  end

  def show
    @expert = Expert.find(params[:id])
    @answered_questions = @expert.answered_questions.sort_by{ |q| q.expert_answer.updated_at }.reverse
    @user_questions = @context.logged_in? ? @expert.questions_by_user_id(@context.user_id).sort_by{ |q| q.created_at }.reverse : nil
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
