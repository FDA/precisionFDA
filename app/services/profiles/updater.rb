module Profiles
  class Updater
    AUTH_METHOD = 'updateEmail'

    def self.call(params, context, profile)
      new(params, context, profile).call
    end

    def initialize(params, context, profile)
      @params = params
      @context = context
      @profile = profile
    end

    def call
      profile.assign_attributes(profile_params)
      return false unless profile.valid?
      update_email if profile.validate_email? && !profile.new_record?
      profile.save(validate: false)
    end

    private

    attr_reader :params, :context, :profile

    def update_email
      profile.assign_attributes(email_confirmed: false)
      api = DNAnexusAuth.new(DNANEXUS_AUTHSERVER_URI, context.token)
      raise ApiError, I18n.t('profiles.updater.InvalidInput') if params[:password].blank? || params[:otp].blank?
      data = { newEmail: profile.email, password: params[:password], otp: params[:otp] }
      api.call("user-#{profile.user.dxuser}", AUTH_METHOD, data)
    rescue AuthError => e
      raise ApiError, I18n.t("profiles.updater.#{e.data['error']['type']}")
    end

    def profile_params
      ActionController::Parameters.new(params).require(:profile).
        permit(
          :address1, :address2, :city, :country_id, :us_state, :phone,
          :postal_code, :phone_country_id, :email, :phone_confirmed
        )
    end
  end
end
