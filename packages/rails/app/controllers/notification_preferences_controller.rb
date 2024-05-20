class NotificationPreferencesController < ApplicationController
  before_action :check_user
  layout "react"

  def index
    render json: { preference: preference.all_attributes }
  end

  def change
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

  def check_user
    return if UserPolicy.access_notification_preference?(current_user)

    redirect_to root_url
  end
end
