class NotificationPreferencesController < ApplicationController

  before_action :check_user

  def index
    js preference: preference
  end

  def update
    preference.attributes = permitted_params
    render json: { success: preference.save }
  end

  private

  def preference
    @preference ||= NotificationPreference.find_or_initialize_by(user_id: @context.user_id)
  end

  def permitted_params
    params.permit(*preference.available_keys)
  end

  private

  def check_user
    return if current_user.spaces.review.any?
    redirect_to root_url
  end

end
