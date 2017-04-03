class ExpertQuestionsController < ApplicationController
  skip_before_action :require_login,     only: [:show_question]
  before_action :require_login_or_guest, only: [:index, :show, :edit, :create, :update]

  def index
    @expert = Expert.find(params[:expert_id])
    redirect_to @expert.editable_by?(@context) ? dashboard_expert_path(@expert) : expert_path(@expert)
  end

  def show
    @expert = Expert.find(params[:expert_id])
    redirect_to expert_path(@expert) and return unless @expert.editable_by?(@context)

    @answered_questions = @expert.answered_questions
    @ignored_questions = @expert.ignored_questions
    @open_questions = @expert.open_questions
    @total_count = @answered_questions.count + @ignored_questions.count + @open_questions.count

    @selected_question = ExpertQuestion.find(params[:id])
    render 'experts/dashboard'
  end

  def show_question
    @expert = Expert.find(params[:expert_id])
    redirect_to experts_path and return unless @expert.editable_by?(@context) || @expert.is_public?
    @user_questions = @context.logged_in? ? @expert.questions_by_user_id(@context.user_id).sort_by{ |q| q.created_at }.reverse : nil
    @expert_question = ExpertQuestion.find(params[:id])
    @items_from_params = [@expert_question.expert, @expert_question]
    @item_comments_path = pathify_comments(@expert_question)
    @comments = @expert_question.root_comments.order(id: :desc).page params[:comments_page]
  end

  def edit
    redirect_to edit_expert_path(params[:expert_id])
  end

  def update
    @expert = Expert.find(params[:expert_id])
    redirect_to experts_path and return unless @expert.editable_by?(@context)

    @selected_question = ExpertQuestion.find(params[:id])

    ExpertQuestion.transaction do
      raise unless @selected_question.update_answer(@expert, params)

      new_state = @selected_question.state
      case params[:commit]
      when "Ignore Question"
        new_state = "ignored"
      when "Submit Answer", "Update Answer"
        new_state = "answered"
      else
        new_state = "open"
      end
      raise unless @selected_question.update_attributes(
         :state => new_state,
         :body => params[:expert_question][:body])
    end
    flash[:success] = "Question/answer information updated successfully."
    redirect_to expert_edit_question_path(@expert, @selected_question)

  rescue Exception => e
    flash[:error] = "Could not update question/answer information. Please try again."
    redirect_to expert_edit_question_path(@expert, @selected_question)
  end

  def create
    @expert = Expert.find(params[:expert_id])
    redirect_to experts_path and return unless @expert.editable_by?(@context)

    q = ExpertQuestion.provision(@expert, @context, params[:expert][:question])
    if q
      flash[:success] = "Your question was submitted successfully."
    else
      flash.now[:error] = "Your question was not submitted because of an unknown reason."
    end
    redirect_to dashboard_expert_path(@expert)
  end
end
