module Api
  # Challenges API controller.
  class ChallengesController < BaseController
    include Paginationable
    include ChallengesHelper
    include RecaptchaHelper

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

    def create
      ActiveRecord::Base.transaction do
        @challenge = Challenge.new(challenge_params)
        if @challenge.save
          @challenge.provision_space!(
            @context,
            challenge_params[:host_lead_dxuser],
            challenge_params[:guest_lead_dxuser],
          )
          @challenge.update_card_image_url!
          render json: @challenge, adapter: :json
        else
          render json: @challenge.errors, status: :unprocessable_entity
        end
      end
    end

    def update
      @challenge = Challenge.find(params[:id])

      ActiveRecord::Base.transaction do
        if @challenge.update(update_challenge_params)
          @challenge.update_card_image_url!
          @challenge.update_order(challenge_params["replacement_id"])

          unless @challenge.space
            @challenge.provision_space!(
              @context,
              challenge_params[:host_lead_dxuser],
              challenge_params[:guest_lead_dxuser],
            )
          end
        else
          render json: @challenge.errors, status: :unprocessable_entity
          return
        end
      end
      render json: @challenge, adapter: :json
    end

    def show
      challenge = accessible_challenges.find_by(id: params[:id])

      unless challenge
        render json: { error: I18n.t("api.challenges.not_found_or_forbidden") }, status: :not_found
        return
      end

      if params[:custom]
        render json: challenge, adapter: :json, serializer: CustomChallengeSerializer
      else
        render json: challenge, adapter: :json
      end
    end

    def scoring_app_users
      render json: app_owners_for_select
    end

    def host_lead_users
      render json: host_lead_dxusers
    end

    def guest_lead_users
      render json: guest_lead_dxusers
    end

    def challenges_for_select
      render json: challenge_order_for_select
    end

    def scopes_for_select
      challenge = Challenge.new
      if params[:id]
        challenge = Challenge.find(params[:id])
      end
      render json: spaces_for_select(@context, challenge)
    end

    def challenge_params
      params.require(:challenge).
        permit(
          :name,
          :description,
          :scope,
          :app_owner_id,
          :start_at,
          :end_at,
          :status,
          :regions,
          :card_image_id,
          :card_image_url,
          :replacement_id,
          :host_lead_dxuser,
          :guest_lead_dxuser,
          :pre_registration_url,
        )
    end

    def update_challenge_params
      params.require(:challenge).
        permit(
          :name,
          :description,
          :scope,
          :app_owner_id,
          :start_at,
          :end_at,
          :status,
          :card_image_id,
          :card_image_url,
          :replacement_id,
          :pre_registration_url,
        )
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

      # PREPARED LOGIC FOR MOVING TO NODE ONCE EMAIL TEMPLATES ARE THERE
      # proposal[:captchaValue] = params[:captchaValue] unless @context.logged_in?
      # https_apps_client.propose_challenge(proposal)

      if @context.logged_in? || verify_captcha_assessment(params[:captchaValue], "propose")
        NotificationsMailer.challenge_proposal_received(proposal).deliver_now
        render json: {}
      else
        raise ApiError,
              "Your proposal was not submitted because of ReCaptcha validation failed, Please try again."
      end
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
