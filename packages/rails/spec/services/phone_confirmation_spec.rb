require 'rails_helper'

RSpec.describe PhoneConfirmationService do
  describe "send and check confirmation code" do
    let(:phone) { "79211234567" }

    it "saves code to database" do
      expect{PhoneConfirmationService.send_code(phone)}.to change{PhoneConfirmation.count}.from(0).to(1)
    end

    it "checks that code is valid" do
      PhoneConfirmationService.send_code(phone)
      PhoneConfirmationService.send_code(phone)
      first_phone_confirmation = PhoneConfirmation.first
      last_phone_confirmation = PhoneConfirmation.last
      result1 = PhoneConfirmationService.code_valid?(phone, first_phone_confirmation.code)
      result2 = PhoneConfirmationService.code_valid?(phone, last_phone_confirmation.code)

      expect(result1).to be true
      expect(result2).to be true
    end

    it "checks that code is invalid" do
      PhoneConfirmationService.send_code(phone)
      result = PhoneConfirmationService.code_valid?(phone, "000000")

      expect(result).to be false
    end
  end
end
