require "rails_helper"

RSpec.describe SpaceMembershipPolicy do
  subject(:can_disable) { described_class.can_disable?(space, initiator, candidate) }

  let(:space) { create(:space) }
  let(:user1) { create(:user, dxuser: "user_1") }
  let(:initiator_role) { SpaceMembership::ROLE_LEAD }
  let(:initiator_side) { SpaceMembership::SIDE_HOST }
  let(:initiator) do
    create(
      :space_membership,
      role: initiator_role,
      side: initiator_side,
      user_id: user1.id,
      spaces: [space],
    )
  end

  let(:user2) { create(:user, dxuser: "user_2") }
  let(:candidate_role) { SpaceMembership::ROLE_CONTRIBUTOR }
  let(:candidate_side) { SpaceMembership::SIDE_HOST }
  let(:candidate) do
    create(
      :space_membership,
      role: candidate_role,
      side: candidate_side,
      user_id: user2.id,
      spaces: [space],
    )
  end

  context "with initiator(host, admin, lead) and candidate(host, admin)" do
    describe "#can_disable?" do
      it "returns true" do
        expect(can_disable).to be_truthy
      end
    end

    describe "#can_lead?" do
      it "returns true" do
        expect(can_disable).to be_truthy
      end
    end

    describe "#can_admin?" do
      it "returns true" do
        expect(can_disable).to be_truthy
      end
    end

    describe "#can_viewer?" do
      it "returns true" do
        expect(can_disable).to be_truthy
      end
    end
  end

  describe "can_move_content?" do
    subject(:can_move_content) { described_class.can_move_content?(verified, membership_host) }

    let(:host_lead) { create(:user, dxuser: "user_1") }
    let(:guest_lead) { create(:user, dxuser: "user_2") }
    let(:verified) do
      create(
        :space,
        :verification,
        :verified,
        host_lead_id: host_lead.id,
        guest_lead_id: guest_lead.id,
      )
    end
    let(:membership_host) { create(:space_membership, user_id: host_lead.id) }
    let(:membership_guest) { create(:space_membership, user_id: guest_lead.id) }

    before { verified.update(state: 1) }

    context "when user is a space member - lead" do
      context "when a space is active" do
        it "a user can move content" do
          expect(can_move_content).to be_truthy
        end
      end

      context "when a space is not active" do
        before { verified.update(state: 0) }

        it "a user can not move content" do
          expect(can_move_content).to be_falsey
        end
      end

      context "when a space is restrict_to_template and not shared" do
        before do
          verified.update(space_id: 1, space_type: 1, restrict_to_template: true)
        end

        it "a user can not move content" do
          expect(can_move_content).to be_falsey
        end
      end
    end

    context "when user is a space member - viewer" do
      before { membership_host.update(role: "viewer") }

      it "a user can not move content" do
        expect(can_move_content).to be_falsey
      end
    end

    context "when a space member is blank" do
      it "a user can not move content" do
        expect(described_class.can_move_content?(verified, nil)).to be_falsey
      end
    end
  end
end
