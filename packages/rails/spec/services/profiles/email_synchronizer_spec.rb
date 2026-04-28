describe Profiles::EmailSynchronizer do
  let(:token) { 'token-123' }
  let(:user) { create(:user, email: 'old@example.com', normalized_email: 'old@example.com') }
  let(:api) { instance_double('DNAnexusAPI') }

  before do
    allow(DNAnexusAPI).to receive(:new).and_call_original
    allow(DNAnexusAPI).to receive(:new).with(token).and_return(api)
  end

  context 'when platform email matches profile email' do
    let!(:profile) { create(:profile, user: user, email: 'new@example.com', email_confirmed: false) }

    it 'marks profile as confirmed and synchronizes user email' do
      allow(api).to receive(:user_describe).with("user-#{user.dxuser}").and_return({ 'email' => 'new@example.com' })

      expect(described_class.call(user, token)).to eq(true)
      expect(user.reload.normalized_email).to eq('new@example.com')
      expect(user.reload.email).to eq('new@example.com')
      expect(profile.reload.email_confirmed).to eq(true)
    end
  end

  context 'when profile has pending unconfirmed email and platform is still old' do
    let!(:profile) { create(:profile, user: user, email: 'pending@example.com', email_confirmed: false) }

    it 'keeps pending profile value and does not force confirmation' do
      allow(api).to receive(:user_describe).with("user-#{user.dxuser}").and_return({ 'email' => 'old@example.com' })

      expect(described_class.call(user, token)).to eq(true)
      expect(user.reload.normalized_email).to eq('old@example.com')
      expect(profile.reload.email).to eq('pending@example.com')
      expect(profile.reload.email_confirmed).to eq(false)
    end
  end

  context 'when profile is already confirmed but diverges from platform' do
    let!(:profile) { create(:profile, user: user, email: 'old@example.com', email_confirmed: true) }

    it 'updates profile and user email to platform value' do
      allow(api).to receive(:user_describe).with("user-#{user.dxuser}").and_return({ 'email' => 'changed@example.com' })

      expect(described_class.call(user, token)).to eq(true)
      expect(user.reload.normalized_email).to eq('changed@example.com')
      expect(profile.reload.email).to eq('changed@example.com')
      expect(profile.reload.email_confirmed).to eq(true)
    end
  end

  context 'when platform request fails' do
    it 'returns false and does not raise' do
      allow(api).to receive(:user_describe).with("user-#{user.dxuser}").and_raise(StandardError.new('boom'))

      expect(described_class.call(user, token)).to eq(false)
    end
  end
end
