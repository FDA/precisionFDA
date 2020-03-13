describe SyncService::Comparisons::ComparisonUpdater do
  subject(:updater) { described_class }

  let(:user) { create(:user) }
  let(:comparison) { create(:comparison, user: user, app_dxid: DEFAULT_COMPARISON_APP) }

  before do
    allow(comparison).to receive(:update!)
  end

  describe "::done!" do
    let(:output_files) { [] }
    let(:meta) { ["some-meta"] }

    it "reloads comparison" do
      allow(comparison).to receive(:reload)
      updater.done!(comparison, output_files, meta, user)
      expect(comparison).to have_received(:reload)
    end

    context "when comparison's state is done" do
      let(:comparison) do
        create(
          :comparison,
          user: user,
          state: Comparison::STATE_DONE,
          app_dxid: DEFAULT_COMPARISON_APP,
        )
      end

      it "does nothing" do
        expect(updater.done!(comparison, output_files, meta, user)).to eq(nil)
      end
    end

    context "when comparison is not in done state" do
      let(:output_1) { { dxid: 1 } }
      let(:output_2) { { dxid: 2 } }
      let(:output_files) { [output_1, output_2] }
      let(:user_file_1) { create(:user_file, user: user) }
      let(:user_file_2) { create(:user_file, user: user) }
      let(:comparison) do
        create(
          :comparison,
          user: user,
          state: Comparison::STATE_PENDING,
          app_dxid: DEFAULT_COMPARISON_APP,
        )
      end

      before do
        allow(UserFile).to receive(:create!).and_return(user_file_1, user_file_2)
        allow(Event::FileCreated).to receive(:create_for)
      end

      it "creates user file for each output" do
        updater.done!(comparison, output_files, meta, user)

        expect(UserFile).to have_received(:create!).
          with(output_1.merge(parent: comparison))

        expect(UserFile).to have_received(:create!).
          with(output_2.merge(parent: comparison))
      end

      it "creates event for each file created" do
        updater.done!(comparison, output_files, meta, user)

        expect(Event::FileCreated).to have_received(:create_for).with(user_file_1, user)
        expect(Event::FileCreated).to have_received(:create_for).with(user_file_2, user)
      end

      it "updates comparison" do
        updater.done!(comparison, output_files, meta, user)

        expect(comparison).to have_received(:update!).
          with(meta: meta, state: Comparison::STATE_DONE)
      end
    end
  end

  describe "::failed!" do
    it "updates comparison" do
      updater.failed!(comparison)

      expect(comparison).to have_received(:update!).
        with(state: Comparison::STATE_FAILED)
    end
  end
end
