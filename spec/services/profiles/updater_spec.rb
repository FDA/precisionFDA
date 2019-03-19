require 'rails_helper'
include Requests::ProfileControllerHelper

RSpec.describe Profiles::Updater, type: :service do
  let(:service_response) { described_class.call(params, context, profile) }
  let(:profile) { create(:profile, email_confirmed: true) }
  let(:context) { Context.new(profile.user.id, nil, SecureRandom.uuid, nil, nil) }

  describe 'when it updates a non-email field' do
    let(:params) { ActionController::Parameters.new(update_phone_request) }
    it 'change the field in database' do
      expect { service_response }.to change { profile.phone }.to(params[:profile][:phone])
    end

    context 'when profile is invalid' do
      before { profile.update(address1: nil) }
      it { expect(service_response).to be_falsey }
    end
  end

  describe 'when it updates a email field' do
    let(:params) { ActionController::Parameters.new(update_email_request) }
    before do
      stub_request(:post, "https://stagingauth.dnanexus.com/user-#{profile.user.dxuser}/updateEmail")
        .to_return(status: 200, body: "{\"emailSentTo\": \"#{profile.email}\"}")
    end
    it 'change email_confirmed field to false' do
      expect { service_response }.to change { profile.email_confirmed }.to(false)
    end

    context 'when password is not supplied' do
      before { params['password'] = nil }
      it 'raise api error' do
        expect { service_response }.to raise_error(ApiError, I18n.t('profiles.updater.InvalidInput'))
      end
    end

    context 'when password is incorrect' do
      before do
        stub_request(:post, "https://stagingauth.dnanexus.com/user-#{profile.user.dxuser}/updateEmail")
          .to_return(status: 400, body: "{\"error\": {\"type\": \"UsernameOrPasswordError\"}}")
      end
      it 'raise api error' do
        expect { service_response }.to raise_error(ApiError, I18n.t('profiles.updater.UsernameOrPasswordError'))
      end
    end

    context 'when otp is incorrect' do
      before do
        stub_request(:post, "https://stagingauth.dnanexus.com/user-#{profile.user.dxuser}/updateEmail")
          .to_return(status: 400, body: "{\"error\": {\"type\": \"OTPMismatchError\"}}")
      end
      it 'raise api error' do
        expect { service_response }.to raise_error(ApiError, I18n.t('profiles.updater.OTPMismatchError'))
      end
    end
  end
end
