module Api
  # Experts API controller.
  class ExpertsController < ApiController
    include Paginationable
    include RecaptchaHelper

    skip_before_action :require_api_login
    before_action :find_expert, only: %i(show update ask_question blog)

    rescue_from ApiError do |exception|
      render_error(exception)
    end

    def index
      page = params[:page].presence || 1
      limit = params[:limit].presence || 10
      year = params[:year] =~ /\A\d+\Z/ ? params[:year].to_i : nil

      experts = https_apps_client.experts_list(page, limit, year)
      render json: experts,
             adapter: :json
    end

    def years
      all_years = https_apps_client.experts_years
      render json: all_years
    end

    def blog
      render json: @expert, adapter: :json
    end

    def show
      # to be updated later, when all expert's pages will be rafactored,
      # including questions & answers
      # unless @expert.is_public?
      #   if @expert.editable_by?(@context)
      #
      #     raise ApiError, "This Expert Q&A Session is private and not viewable by the public"
      #   end
      # end
      render json: @expert, adapter: :json
    end

    def update; end

    def ask_question
      if @context.logged_in?
        exp_question = ExpertQuestion.provision(@expert, @context, params[:question])
      elsif verify_captcha_assessment(params[:captchaValue], "question")
        exp_question = ExpertQuestion.new(
          user_id: nil,
          expert_id: @expert.id,
          state: "open",
          body: params[:question],
          _original: params[:question],
          _edited: false.to_s,
        )
        exp_question.save!
      else
        raise ApiError,
              "Your question was not submitted because of ReCaptcha validation failed, Please try again."
      end

      unless exp_question
        raise ApiError,
              "Your question was not submitted because of an unknown reason, Please try again."
      end

      NotificationsMailer.new_expert_question_email(@expert, exp_question).deliver_now!

      render json: @expert, adapter: :json
    end

    private

    def find_expert
      @expert = Expert.find_by(id: params[:id])

      raise ApiError, "Expert with id: #{params[:id]} is not found" unless @expert
    end

    def render_error(exception)
      json = { error: { type: "Error", message: exception } }
      render json: json, status: :unprocessable_entity
    end
  end
end
