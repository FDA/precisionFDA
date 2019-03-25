module Profiles
  class EmailSynchronizer
    AUTH_METHOD = 'getUserInfo'

    def self.call(user, context)
      api = DNAnexusAuth.new(DNANEXUS_AUTHSERVER_URI, context.token)
      response = api.call("system", AUTH_METHOD)
      return if response['email'].blank?
      if response['email'].downcase == user.profile.email.downcase
        User.transaction do
          user.update!(email: response['email'], normalized_email: response['email'].downcase)
          user.profile.update!(email_confirmed: true)
        end
      end
    end
  end
end
