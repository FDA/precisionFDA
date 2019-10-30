require "rails_helper"

describe UserRemovalPolicy do
  subject(:policy) { described_class }

  let(:org) { build(:org) }
  let(:member) { build(:user, org: org) }
  let(:not_member) { build(:user) }

  describe ".satisfied?" do
    context "when user is not org member" do
      it "returns false" do
        expect(policy).not_to be_satisfied(org, not_member)
      end
    end

    context "when user is org member" do
      it "returns true" do
        expect(policy).to be_satisfied(org, member)
      end
    end
  end
end
