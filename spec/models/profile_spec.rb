require 'rails_helper'

RSpec.describe Profile, type: :model do
  subject { profile }
  let(:profile) { build(:profile, country: country) }
  let(:country) { create(:country, name: 'Russia') }

  before do
    stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{ORG_DUMMY}/invite").to_return(status: 404)
  end
  after { WebMock.reset! }

  describe 'common_validations' do
    it { is_expected.to be_valid }
    it { is_expected.to validate_presence_of(:address1) }
    it { is_expected.to validate_presence_of(:country) }
    it { is_expected.to validate_presence_of(:city) }
    it { is_expected.to validate_presence_of(:postal_code) }
  end

  describe 'us_validations' do
    let(:country) { create(:country, name: 'United States') }
    let(:profile) { build(:profile, country: country, us_state: 'Texas') }

    context 'when country is USA' do
      before do
        stub_request(:get, "https://www.zipcodeapi.com/rest//info.json/#{profile.postal_code}/degrees")
          .to_return(body: "{\"state\":\"TX\"}")
      end
      it { is_expected.to validate_presence_of(:us_state) }
    end

    context 'when postal does not match the state' do
      before do
        stub_request(:get, "https://www.zipcodeapi.com/rest//info.json/#{profile.postal_code}/degrees")
            .to_return(body: "{\"state\":\"WY\"}")
        profile.valid?
      end
      it { expect(profile.errors[:postal_code]).not_to be_empty }
    end

    context 'when postal code matches the state' do
      before do
        stub_request(:get, "https://www.zipcodeapi.com/rest//info.json/#{profile.postal_code}/degrees")
            .to_return(body: "{\"state\":\"TX\"}")
      end
      it { is_expected.to be_valid }
    end

    context 'When the state was changed on non-matching zip code' do
      before do
        stub_request(:get, "https://www.zipcodeapi.com/rest//info.json/#{profile.postal_code}/degrees")
           .to_return(body: "{\"state\":\"TX\"}")
        profile.save
        profile.update(us_state: 'Wyoming')
      end
      it { expect(profile.errors[:postal_code]).not_to be_empty }
    end

    context 'When zip code was not found' do
      before do
        stub_request(:get, "https://www.zipcodeapi.com/rest//info.json/#{profile.postal_code}/degrees")
          .to_raise('')
        profile.valid?
      end
      it { is_expected.not_to be_valid }
    end
  end

  describe 'email validations' do
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to have_db_index(:email).unique(true) }

    context 'when email was changed' do
      before do
        profile.update(email: FFaker::Internet.email)
      end
      it { is_expected.to validate_presence_of(:email) }
    end

    context 'when email has invalid format' do
      let(:profile) { build(:profile, email: 'wrong-email') }
      before { profile.valid? }
      it { expect(profile.errors[:email]).not_to be_empty }
    end

    context 'when email has already been taken on platform' do
      let(:profile) { build(:profile) }
      before do
        stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{ORG_DUMMY}/invite").to_return(body: "{}")
        stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{ORG_DUMMY}/findMembers").to_return(body: "{\"results\":{}}")
        profile.valid?
      end
      it { expect(profile.errors[:email]).not_to be_empty }
    end

    context 'when record is not new' do
      let(:profile) { build(:profile) }
      before do
        profile.save(validate: false)
        profile.update(address1: FFaker::Address.street_address)
      end
      it { expect(WebMock).not_to have_requested(:post, "#{DNANEXUS_APISERVER_URI}#{ORG_DUMMY}/invite") }
    end
  end
end
