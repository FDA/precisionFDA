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
  let(:email) { FFaker::Lorem.word }
  let(:description) { FFaker::Lorem.word }
  let(:review_space) do
    create(:space, :review, :accepted, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
  end
  let(:group_space) do
    create(:space, :group, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
  end
  let(:confidential_sponsor_space) { review_space.confidential_spaces.sponsor.first }
  let(:confidential_rewiever_space) { review_space.confidential_spaces.reviewer.first }

  let(:params) do
    {
      invitees: name,
      invitees_role: SpaceMembership::ROLE_LEAD,
      space: review_space,
      space_id: review_space.id,
      side: SpaceMembership::SIDE_GUEST,
      current_user: host_lead,
    }
  end

  describe "common validations" do
    context "when space_invite_form is valid" do
      context "when invitee is represented by `dxuser`" do
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

      context "when invitee is represented by `email`" do
        before do
          params[:invitees] = user.email
          space_invite_form.validate
        end

        it { is_expected.to be_valid }

        it {
          expect(space_invite_form.errors).to be_empty
          expect(space_invite_form.errors.messages).to eq({})
        }
      end

      context "when space is a `group` type" do
        before do
          params[:invitees] = user.dxuser
          params[:space] = group_space
          params[:space_id] = group_space.id
          space_invite_form.validate
        end

        it { is_expected.to be_valid }

        it {
          expect(space_invite_form.errors).to be_empty
          expect(space_invite_form.errors.messages).to eq({})
        }
      end
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
      context "when invitee is represented by `name`" do
        before do
          params[:invitees] = name
          space_invite_form.validate
        end

        it { is_expected.not_to be_valid }

        it {
          expect(space_invite_form.errors).not_to be_empty
          expect(space_invite_form.errors.messages[:base][0]).to eq(
            "The following usernames could not be added because they do not exist: #{name}",
          )
        }
      end

      context "when invitee is represented by `email`" do
        before do
          params[:invitees] = email
          space_invite_form.validate
        end

        it { is_expected.not_to be_valid }

        it {
          expect(space_invite_form.errors).not_to be_empty
          expect(space_invite_form.errors.messages[:base][0]).to eq(
            "The following usernames could not be added because they do not exist: #{email}",
          )
        }
      end
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
          "The following users could not be added because they" \
          " exist in other space side already: #{host_lead.dxuser}",
        )
      }
    end

    context "when space is confidential" do
      before do
        params[:space] = confidential_sponsor_space
        params[:space_id] = confidential_sponsor_space.id
      end

      context "when invitee is a third user - space_invite_form is valid - validate user sides" do
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

      context "when invitee is from a Private Rewiever area - space_invite_form is not valid" do
        before do
          params[:invitees] = host_lead.dxuser
          space_invite_form.validate
        end

        it { is_expected.not_to be_valid }
        it { expect(space_invite_form.invitees[:dxuser]).to eq [host_lead.dxuser] }

        it {
          expect(space_invite_form.errors).not_to be_empty
          expect(space_invite_form.errors.messages[:base][0][0..98]).to eq(
            "The following users could not be added because they" \
            " exist in other space side already: #{host_lead.dxuser}",
          )
        }
      end

      context "when invitee is from a Private Sponsor area - validate user sides" do
        before do
          params[:invitees] = guest_lead.dxuser
          space_invite_form.validate
        end

        it { is_expected.not_to be_valid }
        it { expect(space_invite_form.invitees[:dxuser]).to eq [guest_lead.dxuser] }

        it {
          expect(space_invite_form.errors).not_to be_empty
          expect(space_invite_form.errors.messages[:base][0][0..98]).to eq(
            "The following users could not be added because they" \
            " exist in other space side already: #{guest_lead.dxuser}",
          )
        }
      end
    end
  end
end
