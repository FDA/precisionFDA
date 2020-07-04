# == Schema Information
#
# Table name: users
#
#  id                          :integer          not null, primary key
#  dxuser                      :string(255)
#  private_files_project       :string(255)
#  public_files_project        :string(255)
#  private_comparisons_project :string(255)
#  public_comparisons_project  :string(255)
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  org_id                      :integer
#  first_name                  :string(255)
#  last_name                   :string(255)
#  email                       :string(255)
#  normalized_email            :string(255)
#  last_login                  :datetime
#  extras                      :text(65535)
#  time_zone                   :string(255)
#  review_app_developers_org   :string(255)      default("")
#  user_state                  :integer          default("enabled"), not null
#  expiration                  :integer
#  disable_message             :string(255)
#

require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { create(:user, dxuser: "user") }

  describe "common user validations" do
    it { is_expected.to be_valid }
    it { is_expected.to validate_presence_of(:email) }
  end

  describe "org_members search" do
    subject(:org_members) { described_class.org_members(search_string, org_handle) }

    let(:org) { create(:org) }
    let(:user_two) { create(:user, dxuser: "user_two") }
    let(:user_three) { create(:user, dxuser: "user_three") }
    let(:user_dxuser_match) { user.dxuser.match(search_string) }
    let(:user_two_dxuser_match) { user_two.dxuser.match(search_string) }
    let(:user_three_dxuser_match) { user_three.dxuser.match(search_string) }

    context "when all users are not org members" do
      let(:org_handle) { org.handle }
      let(:search_string) { "user" }

      context "when users have match in their dxuser" do
        it "search_string match with all users 'dxuser'" do
          expect(user_dxuser_match).to be_truthy
          expect(user_two_dxuser_match).to be_truthy
          expect(user_three_dxuser_match).to be_truthy
        end

        it "match search string, but does not return org members" do
          expect(org_members).to eq []
        end
      end

      context "when users do not have any match in names/dxuser" do
        let(:search_string) { "other_users" }

        it "search_string do not match with all users 'dxuser'" do
          expect(user_dxuser_match).to be_falsey
          expect(user_two_dxuser_match).to be_falsey
          expect(user_three_dxuser_match).to be_falsey
        end

        it "does not match search string and does not return any org members" do
          expect(org_members).to eq []
        end
      end
    end

    context "when some users are org members" do
      let(:org_handle) { org.handle }
      let(:org_id) { org.id }
      let(:search_string) { "user" }

      before do
        user.update(org_id: org_id)
        user_two.update(org_id: org_id)
      end

      context "when users have match in names/dxuser" do
        it "search_string match with all users 'dxuser'" do
          expect(user_dxuser_match).to be_truthy
          expect(user_two_dxuser_match).to be_truthy
          expect(user_three_dxuser_match).to be_truthy
        end

        it "match search string and return some org members" do
          expect(org_members.size).not_to be_nil
          expect(org_members.first).to eq user
          expect(org_members.second).to eq user_two
        end
      end

      context "when users do not have any match in names/dxuser" do
        let(:search_string) { "other_users" }

        it "search_string do not match with all users 'dxuser'" do
          expect(user_dxuser_match).to be_falsey
          expect(user_two_dxuser_match).to be_falsey
          expect(user_three_dxuser_match).to be_falsey
        end

        it "users are org members and have proper org_ids" do
          expect(user.org_id).to eq org_id
          expect(user_two.org_id).to eq org_id
        end

        it "does not match search string and does not return org members" do
          expect(org_members).to eq []
        end
      end
    end
  end
end
