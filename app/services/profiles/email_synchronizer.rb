module Profiles
  class EmailSynchronizer
    AUTH_METHOD = 'getUserInfo'

    def self.call(user, context)
      api = DNAnexusAuth.new(DNANEXUS_AUTHSERVER_URI, context.token)
      response = api.call("system", AUTH_METHOD)
      if response['email'] == user.profile.email
        User.transaction do
          user.update!(email: response['email'])
          user.profile.update!(email_confirmed: true)
        end
      end
    end
  end
end
