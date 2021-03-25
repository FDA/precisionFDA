module Api
  # Challenges API controller.
  class ChallengesController < BaseController
    include Paginationable

    skip_before_action :require_api_login, except: :save_editor_page
    before_action :check_admin, only: :save_editor_page

    def index
      page = params[:page].presence || 1
      year = params[:year] =~ /\A\d+\Z/ ? params[:year].to_i : nil

      challenges = accessible_challenges.order(start_at: :desc).page(page)
      challenges = challenges.where(Arel.sql("YEAR(start_at) = #{year}")) if year

      render json: challenges,
             meta: pagination_dict(challenges),
             adapter: :json
    end

    def show
      challenge = accessible_challenges.find_by(id: params[:id])

      unless challenge
        render json: { error: I18n.t("api.challenges.not_found_or_forbidden") }
        return
      end

      render json: challenge, adapter: :json
    end

    def years
      all_years = accessible_challenges.order(start_at: :desc).pluck(:start_at).map(&:year).uniq

      render json: all_years
    end

    def save_editor_page
      return if params[:regions].blank?

      challenge = Challenge.find(params[:id])

      if challenge.nil?
        render json: { error: "The challenge not found." }.to_json, status: 404
      elsif !challenge.editable_by?(@context)
        render json: { error: "You do not have permission to edit this challenge." }.to_json, status: 403
      end

      challenge.regions = challenge.regions.merge(unsafe_params[:regions])

      if challenge.save
        render json: { msg: "saved" }
      else
        render json: { errors: challenge.errors.full_messages.join(", ") }
      end
    end

    def accessible_challenges
      Challenge.accessible_by(@context)
    end

    def propose
      proposal = params.to_unsafe_h.slice(:name, :email, :organisation,
                                          :specific_question, :specific_question_text,
                                          :data_details, :data_details_text)
      NotificationsMailer.challenge_proposal_received(proposal)
      render json: {}
    end
  end
end
