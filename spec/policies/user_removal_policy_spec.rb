require "rails_helper"

describe UserRemovalPolicy do
  subject(:policy) { described_class }

  let(:org) { build(:org) }
  let(:member) { build(:user, org: org) }
  let(:not_member) { build(:user) }

  describe ".satisfied?" do
    context "when user is not org member" do
      it "returns false" do
        result = policy.satisfied?(org, not_member)

        expect(result).to be_falsey
      end
    end

    context "when user is org member" do
      it "returns true" do
        result = policy.satisfied?(org, member)

        expect(result).to be_truthy
      end
    end
  end
end
