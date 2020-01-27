describe SyncService::Comparisons::ComparisonProcessor do
  subject(:processor) { described_class.new(state_processor, comparison_updater) }

  let(:state_processor) { instance_double(SyncService::Comparisons::StateProcessor) }
  let(:comparison_updater) { class_double(SyncService::Comparisons::ComparisonUpdater) }

  let(:user) { "some-user" }
  let(:comparison) { "some-comparison" }
  let(:job) { "some-job" }

  before do
    allow(state_processor).to receive(:call)
    allow(comparison_updater).to receive_messages(%i(done! failed!))
  end

  describe "#call" do
    it "calls state_processor" do
      processor.call(user, comparison, job)

      expect(state_processor).to have_received(:call).with(user, job, comparison)
    end

    context "when state processor raises EmptyMetaError" do
      before do
        allow(state_processor).to receive(:call).and_raise(SyncService::Comparisons::EmptyMetaError)
      end

      it "fails comparison" do
        processor.call(user, comparison, job)

        expect(comparison_updater).to have_received(:failed!).with(comparison)
      end
    end

    context "when state processor raises JobFailedError" do
      before do
        allow(state_processor).to receive(:call).and_raise(SyncService::Comparisons::JobFailedError)
      end

      it "fails comparison" do
        processor.call(user, comparison, job)

        expect(comparison_updater).to have_received(:failed!).with(comparison)
      end
    end

    context "when state processor doesn't raise JobFailedError or EmptyMetaError" do
      let(:meta) { "some-meta" }
      let(:files) { "some-files" }

      before do
        allow(state_processor).to receive(:call).and_return([meta, files])
      end

      it "updates comparison" do
        processor.call(user, comparison, job)

        expect(comparison_updater).to have_received(:done!).with(comparison, files, meta, user)
      end
    end
  end
end
