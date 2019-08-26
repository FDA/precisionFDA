require 'rails_helper'

RSpec.describe Profiles::EmailSynchronizer, type: :service do
  let(:service_response) { described_class.call(user, context) }
  let(:user) { create(:user) }
  let!(:profile) { create(:profile, email_confirmed: false, user: user) }
  let(:context) { Context.new(user.id, nil, SecureRandom.uuid, nil, nil) }

  describe '#call' do
    context 'when an user changed email in own profile' do
      context 'and has confirmed new email by verification link' do
        before do
          stub_request(:post, "https://stagingauth.dnanexus.com/system/getUserInfo")
            .to_return(status: 200, body: "{\"email\": \"#{profile.email}\"}")
        end
        it 'updates the user email' do
          expect { service_response }.to change { user.email }.to(profile.email)
        end

        it 'and set email_confirm field in profile in true' do
          expect { service_response }.to change { profile.email_confirmed }.to(true)
        end
      end

      context 'and has not confirmed new email by verification link' do
        before do
          stub_request(:post, "https://stagingauth.dnanexus.com/system/getUserInfo")
            .to_return(status: 200, body: "{\"email\": \"#{user.email}\"}")
        end
        it 'does not update the user email' do
          expect { service_response }.not_to change { user.email }
        end

        it 'and does not set email_confirm field in profile in true' do
          expect { service_response }.not_to change { profile.email_confirmed }
        end
      end
    end
  end
end
