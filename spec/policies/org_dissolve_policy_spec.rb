require "rails_helper"

describe OrgDissolvePolicy do
  subject(:policy) { described_class }

  let(:user) { build(:user) }
  let(:admin) { build(:user) }
  let(:org) { build(:org, admin: admin) }

  describe ".satisfied?" do
    context "when user is org admin" do
      it "returns true" do
        result = policy.satisfied?(org, admin)

        expect(result).to be_truthy
      end
    end

    context "when user is not org admin" do
      it "returns false" do
        result = policy.satisfied?(org, user)

        expect(result).to be_falsey
      end
    end
  end
end
