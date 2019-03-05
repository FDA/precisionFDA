module Profiles
  class Getter
    def self.call(user)
      new(user).call
    end

    def initialize(user)
      @user = user
    end

    def call
      return user.profile if user.profile
      return build_profile_from_invitation if user.invitation
      user.build_profile
    end

    private

    attr_reader :user

    def build_profile_from_invitation
      invitation = user.invitation
      attributes = user.invitation.slice(:address1, :address2, :phone, :city, :us_state, :postal_code)
      attributes[:country_id] = invitation.country
      attributes[:phone_country_id] = invitation.phone_country_code
      user.build_profile(attributes)
    end
  end
end
