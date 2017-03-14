class ExpertQuestionsController < ApplicationController
  skip_before_action :require_login,     only: []
  before_action :require_login_or_guest, only: [:index, :show, :edit, :create]

  def index
    @expert = Expert.find(params[:expert_id])
    redirect_to @expert.editable_by?(@context) ? dashboard_expert_path(@expert) : expert_path(@expert)
  end

  def show
    @expert = Expert.find(params[:expert_id])
    redirect_to experts_path unless @expert.editable_by?(@context)

    @answered_questions = @expert.answered_questions
    @ignored_questions = @expert.ignored_questions
    @open_questions = @expert.open_questions
    @total_count = @answered_questions.count + @ignored_questions.count + @open_questions.count

    @selected_question = ExpertQuestion.find(params[:id])
    render 'experts/dashboard'
  end

  def edit
    redirect_to edit_expert_path(params[:expert_id])
  end

  def update
    @expert = Expert.find(params[:expert_id])
    redirect_to experts_path unless @expert.editable_by?(@context)

    @selected_question = ExpertQuestion.find(params[:id])
    ExpertQuestion.transaction do
      @selected_question.update_question(@expert, params)
    end
    redirect_to expert_expert_question_path(@expert, @selected_question)
  end

  def create
    @expert = Expert.find(params[:expert_id])
    redirect_to experts_path unless @expert.editable_by?(@context)

    q = ExpertQuestion.provision(@expert, @context, params[:expert][:question])
    if q
      flash[:success] = "Your question was submitted successfully."
    else
      flash.now[:error] = "Your question was not submitted because of an unknown reason."
    end
    redirect_to dashboard_expert_path(@expert)
  end
end
