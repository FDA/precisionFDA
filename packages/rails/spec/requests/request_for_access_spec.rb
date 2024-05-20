require "rails_helper"

describe "Request for access", type: :request do
  let!(:country) { create(:country, name: "United States", dial_code: "+1") }

  context "when visiting request for access page" do
    before do
      get request_access_path
    end

    it "renders request access form" do
      expect(response.body).to include("To request access, please leave your information below.")
    end
  end

  context "when requesting for access" do
    before do
      post request_access_path, params: {
        invitation: {
          first_name: FFaker::Name.first_name,
          last_name: FFaker::Name.first_name,
          email: FFaker::Internet.email,
          duns: FFaker::Guid.guid,
          address1: FFaker::Address.street_address,
          address2: FFaker::Address.street_address,
          country_id: country.id,
          us_state: FFaker::AddressUS.state,
          city: FFaker::Address.city,
          postal_code: FFaker::AddressUS.zip_code,
          phone_country_id: country.id,
          phone: FFaker::PhoneNumber.phone_number,
          req_reason: FFaker::Lorem.words.join,
        },
      }
    end

    it "renders successful registration message" do
      expect(response.body).to include("Thank you! Your request has been registered.")
    end
  end
end
