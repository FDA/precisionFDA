RSpec.describe MemberRemovalPolicy do
  subject(:policy) { described_class }

  describe ".satisfied?" do
    let(:org) { build(:org) }
    let(:admin) { build(:user, org: org) }
    let(:member) { build(:user, org: org) }
    let(:not_a_member) { build(:user) }

    before do
      org.update!(admin: admin)
    end

    context "when user is org member" do
      context "when user is org admin" do
        it "returns false" do
          expect(policy).not_to be_satisfied(org, admin)
        end
      end

      context "when user is not org admin" do
        it "returns true" do
          expect(policy).to be_satisfied(org, member)
        end
      end
    end

    context "when user is not org member" do
      it "returns false" do
        expect(policy).not_to be_satisfied(org, not_a_member)
      end
    end
  end
end
