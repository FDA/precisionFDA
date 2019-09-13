module Api
  class ChallengesController < BaseController

    before_action :check_admin

    def save_editor_page
      return if unsafe_params[:regions].blank?

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

    private

    def challenge
      @challenge ||= Challenge.find(unsafe_params[:id])
    end

  end
end
