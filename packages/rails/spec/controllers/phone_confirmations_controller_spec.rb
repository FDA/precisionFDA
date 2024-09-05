require 'rails_helper'

RSpec.describe PhoneConfirmationsController, type: :controller do

  describe "POST create" do

    it "sends an confirmation code" do
      phone = "1234567890"
      post :create, params: { phone: phone }

      expect(response.status).to eq(200)
    end

  end

  describe "GET check_code" do

    it "checks that confirmation code is valid" do
      phone = "1234567890"
      PhoneConfirmationService.send_code(phone)
      last_phone_confirmation = PhoneConfirmation.last
      get :check_code, params: { phone: phone, code: last_phone_confirmation.code }

      expect(response.status).to eq(200)
    end

    it "checks that confirmation code is invalid" do
      phone = "1234567890"
      PhoneConfirmationService.send_code(phone)
      get :check_code, params: { phone: phone, code: "123456" }

      expect(response.status).to eq(422)
    end

  end
end
