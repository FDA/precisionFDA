require 'rails_helper'

RSpec.describe Profiles::Getter, type: :service do
  let(:service_response) { described_class.call(user) }
  let(:user) { create(:user) }

  describe '#call' do
    context 'when a user has a profile' do
      let!(:profile) { create(:profile, user: user) }

      it 'return the profile' do
        expect(service_response).to have_attributes(profile.attributes)
      end
    end

    context 'when a user does not has a profile' do
      let!(:org) { create(:org, admin: user) }
      let(:invitation) { build(:invitation, user: user, org: org) }

      before { invitation.save(validate: false) }

      it 'build a profile by using user invitation' do
        attributes = invitation.slice(:address1, :address2, :phone, :city, :us_state, :postal_code)
        attributes[:country_id] = invitation.country.to_i
        attributes[:phone_country_id] = invitation.phone_country_code.to_i
        expect(service_response).to have_attributes(attributes)
      end
    end
  end
end
