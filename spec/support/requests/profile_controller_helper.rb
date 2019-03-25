module Requests
  module ProfileControllerHelper
    def update_email_request
      {
        profile: { email: FFaker::Internet.email },
        password: FFaker::Internet.password,
        otp: FFaker::Random.seed
      }
    end

    def update_phone_request
      {
        profile: { phone: FFaker::PhoneNumber.phone_number }
      }
    end
  end
end