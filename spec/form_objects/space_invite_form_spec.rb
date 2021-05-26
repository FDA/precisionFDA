# Model name: space_invite_form
#
# Attributes:
#  invitees_role :string(255)
#  space         :text(65535)
#  space_id      :string(255)
#  side          :string(255)
#  invitees      :string(255)
#
require "rails_helper"

RSpec.describe SpaceInviteForm, type: :model do
  subject(:space_invite_form) { described_class.new(params) }

  let(:host_lead) { create(:user, dxuser: "user_host") }
  let(:guest_lead) { create(:user, dxuser: "user_guest") }
  let(:user) { create(:user, dxuser: "user_3") }
  let(:name) { FFaker::Lorem.word }
  let(:description) { FFaker::Lorem.word }
  let(:review_space) do
    create(:space, :review, :accepted, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
  end
  let(:params) do
    {
      invitees: name,
      invitees_role: SpaceMembership::ROLE_LEAD,
      space: review_space,
      space_id: review_space.id,
      side: SpaceMembership::SIDE_GUEST,
    }
  end

  describe "common validations" do
    context "when space_invite_form is valid" do
      before do
        params[:invitees] = user.dxuser
        space_invite_form.validate
      end

      it { is_expected.to be_valid }

      it {
        expect(space_invite_form.errors).to be_empty
        expect(space_invite_form.errors.messages).to eq({})
      }
    end

    context "when invitees list is empty - validate_invitees" do
      before do
        params[:invitees] = ""
        space_invite_form.validate
      end

      it { is_expected.not_to be_valid }

      it {
        expect(space_invite_form.errors).not_to be_empty
        expect(space_invite_form.errors.messages[:invitees][0]).to eq(
          "List of invitees is empty!",
        )
      }
    end

    context "when invitee does not exist - validate dxusers" do
      before do
        params[:invitees] = name
        space_invite_form.validate
      end

      it { is_expected.not_to be_valid }

      it {
        expect(space_invite_form.errors).not_to be_empty
        expect(space_invite_form.errors.messages[:base][0]).to eq(
          "The following username's could not be added because they do not exist: #{name}",
        )
      }
    end

    context "when invitee is from other space side - validate user sides" do
      before do
        params[:invitees] = host_lead.dxuser
        space_invite_form.validate
      end

      it { is_expected.not_to be_valid }
      it { expect(space_invite_form.invitees[:dxuser]).to eq [host_lead.dxuser] }

      it {
        expect(space_invite_form.errors).not_to be_empty
        expect(space_invite_form.errors.messages[:base][0][0..98]).to eq(
          "The following user's could not be added because they" \
          " exist in other space side already: #{host_lead.dxuser}",
        )
      }
    end
  end
end
