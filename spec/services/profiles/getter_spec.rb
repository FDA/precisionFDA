require 'rails_helper'

RSpec.describe Profiles::Getter, type: :service do
  let(:service_response) { described_class.call(user, context) }
  let(:context) { Context.new(user.id, nil, nil, nil, nil) }
  let(:user) { create(:user) }

  describe '#call' do
    context 'when an user has a profile' do
      let!(:profile) { create(:profile, user: user, email_confirmed: true) }

      it 'return the profile' do
        expect(service_response).to have_attributes(profile.attributes)
      end
    end

    context 'when an user does not have a profile, but has an invitation' do
      let!(:org) { create(:org, admin: user) }
      let(:country) { create(:country) }
      let(:invitation) { build(:invitation, user: user, org: org, country: country, phone_country: country) }
      before { invitation.save(validate: false) }

      it 'build a profile by using user invitation' do
        attributes = invitation.slice(:address1, :address2, :phone, :city,
                                      :us_state, :postal_code, :country, :phone_country)
        expect(service_response).to have_attributes(attributes.merge(email: user.normalized_email))
      end
    end

    context 'when an user does not have a profile and an invitation' do
      it 'create a new profile' do
        expect(service_response).to eq(user.profile)
      end
    end
  end
end
