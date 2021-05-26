# Model name: space_form
#
# Attributes:
#  name                 :string(255)
#  description          :text(65535)
#  host_lead_dxuser     :string(255)
#  guest_lead_dxuser    :string(255)
#  space_type           :string(255)
#  cts                  :string(255)
#  sponsor_org_handle   :string(255)
#  sponsor_lead_dxuser  :string(255)
#  source_space_id      :integer
#  restrict_to_template :boolean      default(FALSE)
#
require "rails_helper"

RSpec.describe SpaceForm, type: :model do
  subject { SpaceForm.new(params) }

  let(:host_lead) { create(:user, dxuser: "user_host") }
  let(:name) { FFaker::Lorem.word }
  let(:description) { FFaker::Lorem.word }
  let(:params) { { name: name, description: description } }

  describe "common validations" do
    context "when name is empty" do
      before { params[:name] = nil }

      it { is_expected.not_to be_valid }
    end

    context "when description is empty" do
      before { params[:description] = nil }

      it { is_expected.not_to be_valid }
    end
  end

  describe "validations in review space" do
    let(:sponsor_lead) { create(:user, dxuser: "user_sponsor") }

    before { params.merge!(space_type: "review") }

    context "when Reviewer Lead and Sponsor Lead are valid" do
      before do
        params.merge!(
          host_lead_dxuser: host_lead.dxuser,
          sponsor_lead_dxuser: sponsor_lead.dxuser,
        )
      end

      it { is_expected.to be_valid }
    end

    context "when Reviewer Lead is invalid" do
      before do
        params.merge!(
          host_lead_dxuser: "",
          sponsor_lead_dxuser: sponsor_lead.dxuser,
        )
      end

      it { is_expected.not_to be_valid }
    end

    context "when Sponsor Lead is invalid" do
      before do
        params.merge!(
          host_lead_dxuser: host_lead.dxuser,
          sponsor_lead_dxuser: "",
        )
      end

      it { is_expected.not_to be_valid }
    end

    context "when Reviewer Lead and Sponsor Lead are the same" do
      before do
        params.merge!(
          host_lead_dxuser: host_lead.dxuser,
          sponsor_lead_dxuser: host_lead.dxuser,
        )
      end

      it { is_expected.not_to be_valid }
    end

    context "when Reviewer Lead and Sponsor Lead are from the same org" do
      let(:sponsor_lead_same_org) do
        create(
          :user,
          dxuser: "user_sponsor_same_org",
          first_name: FFaker::Name.first_name,
          last_name: FFaker::Name.html_safe_last_name,
          email: FFaker::Internet.email,
          normalized_email: "",
          org_id: host_lead.org_id,
          last_login: 1.day.ago,
          private_files_project: "project-test",
          public_files_project: "public-files-project",
        )
      end

      before do
        params.merge!(
          host_lead_dxuser: host_lead.dxuser,
          sponsor_lead_dxuser: sponsor_lead_same_org.dxuser,
        )
      end

      it { is_expected.not_to be_valid }
    end
  end
end
