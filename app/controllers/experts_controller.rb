class ExpertsController < ApplicationController
  skip_before_action :require_login,     only: [:index, :show, :ask_question, :blog]
  before_action :require_login_or_guest, only: [:edit, :update, :create, :new]

  def index
    @experts = Expert.viewable_by(@context).order(id: :desc)
  end

  def blog
    @expert = Expert.find(params[:id])
    if !@expert.is_public?
      if !@expert.editable_by?(@context)
        redirect_to experts_path and return
      else
        flash.now[:warning] = "This Expert Q&A Session is currently private and not viewable by the public."
      end
    end

    js expert: @expert.slice(:id, :_blog, :_blog_title)
  end

  def new
    redirect_to experts_path and return unless @context.logged_in? && @context.user.can_administer_site?
    @users = User.all.order(:first_name).map{|u| ["#{u.username} (#{u.full_name.titleize}, #{u.org.name})", u.username]}
    @expert = Expert.new
  end

  def edit
    @expert = Expert.find(params[:id])
    redirect_to experts_path(@expert) and return unless @expert.editable_by?(@context) || @context.user.can_administer_site?

    js imageUrl: @expert.image, fileId: @expert._image_id
  end

  def update
    @expert = Expert.find(params[:id])
    redirect_to experts_path and return unless @expert.editable_by?(@context) || @context.user.can_administer_site?

    Expert.transaction do
      if @expert.update_expert(@context, update_expert_params)
        flash[:success] = "Expert information updated."
        redirect_to expert_path(@expert)
      else
        flash[:error] = "Could not update expert information. Please try again."
        render :edit
      end
    end
  end

  def open
    @expert = Expert.find(params[:id])
    redirect_to experts_path and return unless @expert.editable_by?(@context)

    Expert.transaction do
      if @expert.update_attribute(:state, "open")
        flash[:success] = "This Expert-of-the-Month is now open."
      else
        flash[:error] = "Could not update Expert-of-the-Month state."
      end
      redirect_to dashboard_expert_path(@expert)
    end
  end

  def close
    @expert = Expert.find(params[:id])
    redirect_to experts_path and return unless @expert.editable_by?(@context)

    Expert.transaction do
      if @expert.update_attribute(:state, "closed")
        flash[:success] = "This Expert-of-the-Month is now closed"
      else
        flash[:error] = "Could not update Expert-of-the-Month state"
      end
      redirect_to dashboard_expert_path(@expert)
    end
  end

  def ask_question
    expert = Expert.find(params[:id])
    redirect_to experts_path and return unless expert.askable?

    if @context.logged_in?
      exp_question = ExpertQuestion.provision(expert, @context, params[:expert][:question])
      if exp_question
        NotificationsMailer.new_expert_question_email(expert, exp_question).deliver_now!
        flash[:success] = "Your question was submitted successfully."
      else
        flash[:error] = "Your question was not submitted because of an unknown reason, Please try again."
      end
    else
      @exp_question = ExpertQuestion.new(
          :user_id => nil,
          :expert_id => expert.id,
          :state => "open",
          :body => params[:expert][:question],
          :_original => params[:expert][:question],
          :_edited => false.to_s
      )
      if verify_recaptcha(model: @exp_question) && @exp_question.save!
        NotificationsMailer.new_expert_question_email(expert, @exp_question).deliver_now!
        flash[:success] = "Your question was submitted successfully."
      else
        flash[:error] = "Your question was not submitted because of an unknown reason. Please try again."
      end
    end

    redirect_to expert_path(expert)
  end

  def create
    redirect_to experts_path unless @context.user.can_administer_site?

    user = User.find_by(dxuser: expert_params[:username])
    if user.nil?
      flash[:error] = "Expert username #{expert_params[:username]} not found!"
    else
      expert = Expert.provision(@context, expert_params)
      if expert
        NotificationsMailer.new_expert_email(expert).deliver_now!
        redirect_to experts_path
        flash[:success] = "A new Expert of the Month was successfully created for #{expert.user.full_name.titleize} (#{expert.user.dxuser})."
        return
      else
        flash[:error] = "The Expert could not be provisioned because of an unknown reason."
      end
    end

    # Here only if error
    @expert = Expert.new(expert_params)
    redirect_to new_expert_path(@expert)
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
    if !@expert.is_public?
      if !@expert.editable_by?(@context)
        redirect_to experts_path and return
      else
        flash.now[:warning] = "This Expert Q&A Session is currently private and not viewable by the public."
      end
    end

    @answered_questions = @expert.answered_questions.sort_by{ |q| q.expert_answer.updated_at }.reverse
    @user_questions = @context.logged_in? && !@context.guest? ? @expert.questions_by_user_id(@context.user_id).sort_by{ |q| q.created_at }.reverse : []
  end

  def destroy
    expert = Event.editable_by(@context).find(params[:id])
    redirect_to experts_path unless @expert.editable_by?(@context)

    name = user_title(expert.user)

    expert.destroy

    flash[:success] = "Expert Q&A Session: \"#{name}\" has been successfully deleted"
    redirect_to :experts
  end

  private
    def expert_params
      p = params.require(:expert).permit(:username, :_prefname, :_about, :_blog, :_blog_title, :_challenge, :_image_id, :scope)
      p.require(:username)
      p.require(:scope)
      p.require(:_image_id)
      return p
    end

    def update_expert_params
      p = params.require(:expert).permit(:_prefname, :_about, :_blog, :_blog_title, :_challenge, :_image_id, :scope)
      p.require(:_image_id)
      return p
    end
end
