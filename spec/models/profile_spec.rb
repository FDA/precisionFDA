# == Schema Information
#
# Table name: profiles
#
#  id               :integer          not null, primary key
#  address1         :string(255)
#  address2         :string(255)
#  city             :string(255)
#  email            :string(255)
#  email_confirmed  :boolean          default(FALSE)
#  postal_code      :string(255)
#  phone            :string(255)
#  phone_confirmed  :boolean          default(FALSE)
#  us_state         :string(255)
#  user_id          :integer
#  country_id       :integer
#  phone_country_id :integer
#

require 'rails_helper'

RSpec.describe Profile, type: :model do
  subject { profile }
  let(:profile) { build(:profile, country: country) }
  let(:country) { create(:country, name: 'Russia') }

  describe 'common_validations' do
    it { is_expected.to be_valid }
  end

  describe 'email validations' do
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to have_db_index(:email).unique(true) }

    context 'when email was changed' do
      before do
        profile.update(email: FFaker::Internet.email)
      end
      it { is_expected.to validate_presence_of(:email) }
      it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    end

    context 'when email was changed to upper case' do
      before do
        profile.save
        WebMock.reset!
        stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{ORG_DUMMY}/invite").to_return(body: "{}")
        stub_request(:post, "#{DNANEXUS_APISERVER_URI}#{ORG_DUMMY}/findMembers").to_return(body: "{\"results\":{}}")
        profile.update(email: profile.email.upcase)
      end
      it { expect(profile.errors[:email]).to be_empty }
    end

    context 'when email has invalid format' do
      let(:profile) { build(:profile, email: 'wrong-email') }
      before { profile.valid? }
      it { expect(profile.errors[:email]).not_to be_empty }
    end

    context 'when email has already been taken on platform' do
      let(:profile) { build(:profile) }
      before do
        WebMock.reset!
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
