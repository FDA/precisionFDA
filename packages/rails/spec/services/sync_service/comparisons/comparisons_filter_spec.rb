describe SyncService::Comparisons::ComparisonsFilter do
  subject(:filter) { described_class }

  let(:user_1) { create(:user) }
  let(:user_2) { create(:user) }

  let!(:comparison_1) do
    create(
      :comparison,
      user: user_1,
      state: Comparison::STATE_PENDING,
      app_dxid: DEFAULT_COMPARISON_APP,
    )
  end

  let!(:comparison_2) do
    create(
      :comparison,
      user: user_1,
      state: Comparison::STATE_PENDING,
      app_dxid: DEFAULT_COMPARISON_APP,
    )
  end

  let!(:comparison_3) do
    create(
      :comparison,
      user: user_1,
      state: Comparison::STATE_DONE,
      app_dxid: DEFAULT_COMPARISON_APP,
    )
  end

  let!(:comparison_4) do
    create(
      :comparison,
      user: user_2,
      state: Comparison::STATE_PENDING,
      app_dxid: DEFAULT_COMPARISON_APP,
    )
  end

  describe "::call" do
    context "when no ids given" do
      it "returns all user's pending comparisons" do
        comparisons = filter.call(user_1)

        expect(comparisons.size).to eq(2)
        expect(comparisons[0]).to eq(comparison_1)
        expect(comparisons[1]).to eq(comparison_2)
      end
    end

    context "when ids of user's comparisons are given" do
      it "returns required user's pending comparisons" do
        comparisons = filter.call(user_1, [comparison_1.id])

        expect(comparisons.size).to eq(1)
        expect(comparisons[0]).to eq(comparison_1)
      end
    end

    context "when user's comparison is not in pending state" do
      it "doesn't return it" do
        comparisons = filter.call(user_1, [comparison_3.id])

        expect(comparisons.size).to eq(0)
      end
    end

    context "when pending comparison belongs to another user" do
      it "doesn't return it" do
        comparisons = filter.call(user_1, [comparison_4.id])

        expect(comparisons.size).to eq(0)
      end
    end
  end
end
