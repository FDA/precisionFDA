module Api

  class NotificationPreferencesController < ApiController
    # wrap_parameters format: []

    def index
      render json: { preference: preference.all_attributes }
    end

    def change
      puts params
      puts "permitted params"
      puts permitted_params
      # preference.data = permitted_params
      # todo: update or create?
      # preference.update!(permitted_params)
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

    private

    def check_user
      return if UserPolicy.access_notification_preference?(current_user)
      redirect_to root_url
    end

  end
end