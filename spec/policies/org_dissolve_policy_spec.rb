require "rails_helper"

describe OrgDissolvePolicy do
  subject(:policy) { described_class }

  let(:user) { build(:user) }
  let(:admin) { build(:user) }
  let(:org) { build(:org, admin: admin) }

  describe ".satisfied?" do
    context "when user is org admin" do
      it "returns true" do
        expect(policy).to be_satisfied(org, admin)
      end
    end

    context "when user is not org admin" do
      it "returns false" do
        expect(policy).not_to be_satisfied(org, user)
      end
    end
  end
end
