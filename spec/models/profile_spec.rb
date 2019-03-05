require 'rails_helper'

RSpec.describe Profile, type: :model do
  subject { profile }
  after { WebMock.reset! }

  describe 'common_validations' do
    let(:profile) { build(:profile, country: country) }
    let(:country) { create(:country, name: 'Mars') }

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
end
