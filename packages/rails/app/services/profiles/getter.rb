module Profiles
  class Getter
    def self.call(user, context)
      new(user, context).call
    end

    def initialize(user, context)
      @user = user
      @context = context
    end

    def call
      if user.profile
        EmailSynchronizer.call(user, context) unless user.profile.email_confirmed
        return user.profile
      end
      return build_profile_from_invitation if user.invitation
      profile = user.build_profile(email: user.normalized_email)
      profile.save(validate: false)
      profile
    end

    private

    attr_reader :user, :context

    def build_profile_from_invitation
      attributes = user.invitation.slice(:address1, :address2, :phone, :city, :us_state,
                                         :postal_code, :country, :phone_country)
      profile = user.build_profile(attributes.merge(email: user.normalized_email))
      profile.save(validate: false)
      profile
    end
  end
end
