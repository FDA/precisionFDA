module Api
  # Submissions API controller.
  class SubmissionsController < BaseController
    skip_before_action :require_api_login
    before_action :require_api_login_or_guest

    def index
      challenge_id = params[:challenge_id]
      challenge = accessible_challenges.find_by(id: challenge_id)

      unless challenge
        render json: { error: I18n.t("api.challenges.not_found_or_forbidden") }
        return
      end

      submissions = challenge.submissions.accessible_by_public.order(id: :desc)

      render json: submissions,
             adapter: :json
    end

    def my_entries
      challenge_id = params[:challenge_id]
      challenge = accessible_challenges.find_by(id: challenge_id)

      unless challenge
        render json: { error: I18n.t("api.challenges.not_found_or_forbidden") }
        return
      end

      submissions = challenge.submissions.editable_by(@context).order(id: :desc)

      render json: submissions,
             adapter: :json
    end

    def accessible_challenges
      Challenge.accessible_by(@context)
    end
  end
end
