require 'rails_helper'

RSpec.describe SpaceMembershipPolicy do
  let(:space) { create(:space) }


  let(:user1) { create(:user, dxuser: "user_1") }
  let(:initiator_role) { SpaceMembership::ROLE_LEAD }
  let(:initiator_side) { SpaceMembership::SIDE_HOST }
  let(:initiator) { create(:space_membership, role: initiator_role, side: initiator_side, user_id: user1.id, spaces: [space]) }

  let(:user2) { create(:user, dxuser: "user_2") }
  let(:candidate_role) { SpaceMembership::ROLE_CONTRIBUTOR }
  let(:candidate_side) { SpaceMembership::SIDE_HOST }
  let(:candidate) { create(:space_membership, role: candidate_role, side: candidate_side, user_id: user2.id, spaces: [space]) }

  subject { described_class.can_disable?(space, initiator, candidate) }

  context "initiator(host, admin, lead) and candidate(host, admin)" do

    describe "#can_disable?" do
      it "returns true" do
        expect(subject).to be_truthy
      end
    end

    describe "#can_lead?" do
      it "returns true" do
        expect(subject).to be_truthy
      end
    end

    describe "#can_admin?" do
      it "returns true" do
        expect(subject).to be_truthy
      end
    end

    describe "#can_viewer?" do
      it "returns true" do
        expect(subject).to be_truthy
      end
    end

  end

end
