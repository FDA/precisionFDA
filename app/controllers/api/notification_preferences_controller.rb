module Api
  # Notification Preferences API controller.
  class NotificationPreferencesController < ApiController
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
      params.require(:notification_preference).permit(*preference.available_keys)
    end

    def check_user
      return if UserPolicy.access_notification_preference?(current_user)

      redirect_to root_url
    end
  end
end
