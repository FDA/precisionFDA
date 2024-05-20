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
end
