describe Users::ChargesFetcher do
  let(:user_api) { instance_double("DNAnexusAPI") }
  let(:user) do
    create :user,
           charges_baseline: { computeCharges: 1, storageCharges: 2, dataEgressCharges: 3 }
  end

  describe "#fetch" do
    it "fetches and calculates current charges" do
      allow(user_api).to receive(:user_charges).and_return({
        computeCharges: 2,
        storageCharges: 1,
        dataEgressCharges: 5,
      })

      expect(described_class.fetch(user_api, user)).to include(
        totalCharges: 3,
        computeCharges: 1,
        storageCharges: 0,
        dataEgressCharges: 2,
      )
    end
  end

  describe "#exceeded_charges_limit?" do
    let(:current_charges) do
      {
        computeCharges: 2,
        storageCharges: 1,
        dataEgressCharges: 5,
      }
    end

    context "when user exceeds charges limit" do
      before { user.update(total_limit: 2.5) }

      it "returns true" do
        allow(user_api).to receive(:user_charges).and_return(current_charges)

        expect(described_class).to be_exceeded_charges_limit(user_api, user)
      end
    end

    context "when user doesn't exceed charges limit" do
      before { user.update(total_limit: 4) }

      it "returns false" do
        allow(user_api).to receive(:user_charges).and_return(current_charges)

        expect(described_class).not_to be_exceeded_charges_limit(user_api, user)
      end
    end
  end
end
