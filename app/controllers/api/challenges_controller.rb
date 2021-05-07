module Api
  # Challenges API controller.
  class ChallengesController < BaseController
    include Paginationable

    skip_before_action :require_api_login, except: :save_editor_page
    before_action :check_admin, only: :save_editor_page

    CHALLENGE_UPCOMING = "upcoming".freeze
    CHALLENGE_CURRENT = "current".freeze
    CHALLENGE_ENDED = "ended".freeze

    TIME_STATUSES = [CHALLENGE_UPCOMING, CHALLENGE_CURRENT, CHALLENGE_ENDED].freeze

    def index
      challenges = filter_challenges

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
      proposal = unsafe_params.slice(:name, :email, :organisation,
                                     :specific_question, :specific_question_text,
                                     :data_details, :data_details_text)
      NotificationsMailer.challenge_proposal_received(proposal)
      render json: {}
    end

    private

    def filter_challenges
      page = params[:page].presence || 1
      year = params[:year] =~ /\A\d+\Z/ ? params[:year].to_i : nil

      time_status = params[:time_status] if TIME_STATUSES.include?(params[:time_status].presence)

      challenges = accessible_challenges.order(end_at: :desc).page(page)
      challenges = Challenge.where(Arel.sql("YEAR(start_at) = #{year}")) if year

      current_time = Time.current

      case time_status
      when CHALLENGE_UPCOMING
        challenges.where("start_at > ?", current_time)
      when CHALLENGE_CURRENT
        challenges.where("start_at < ?", current_time).where("end_at > ?", current_time)
      when CHALLENGE_ENDED
        challenges.where("end_at < ?", current_time)
      else
        challenges
      end
    end
  end
end
