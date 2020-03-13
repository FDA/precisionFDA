describe SyncService::Comparisons::Synchronizer do
  subject(:synchronizer) { described_class.new(api, filter, processor) }

  let(:api) { instance_double(DNAnexusAPI) }
  let(:project) { "some-project" }
  let(:user) { create(:user, private_comparisons_project: project) }
  let(:filter) { instance_double(SyncService::Comparisons::ComparisonsFilter) }
  let(:processor) { instance_double(SyncService::Comparisons::ComparisonProcessor) }

  before do
    allow(filter).to receive(:call).and_return([comparison_1, comparison_2])
    allow(api).to receive(:system_find_jobs).and_return(find_results)
    allow(processor).to receive(:call)
  end

  describe "#sync_comparisons!" do
    let(:comparison_1) { create(:comparison, user: user, app_dxid: DEFAULT_COMPARISON_APP) }
    let(:comparison_2) { create(:comparison, user: user, app_dxid: DEFAULT_COMPARISON_APP) }
    let(:comparisons_ids) { [comparison_1.id, comparison_2.id] }
    let(:jobs_dxids) { [comparison_1.dxjobid, comparison_2.dxjobid] }
    let(:job_1) { { "id" => comparison_1.dxjobid } }
    let(:job_2) { { "id" => comparison_2.dxjobid } }
    let(:find_results) do
      {
        "results" => [
          { "describe" => job_1 },
          { "describe" => job_2 },
        ],
      }
    end

    context "when no ids are given" do
      it "filters all comparisons" do
        synchronizer.sync_comparisons!(user)

        expect(filter).to have_received(:call).with(user, [])
      end
    end

    context "when ids are given" do
      it "filters comparisons with given ids" do
        synchronizer.sync_comparisons!(user, comparisons_ids)

        expect(filter).to have_received(:call).with(user, comparisons_ids)
      end
    end

    it "searches jobs for found comparisons" do
      synchronizer.sync_comparisons!(user, comparisons_ids)

      expect(api).to have_received(:system_find_jobs).with(
        includeSubjobs: false,
        id: jobs_dxids,
        project: project,
        parentJob: nil,
        parentAnalysis: nil,
        describe: true,
      )
    end

    it "processes comparisons" do
      synchronizer.sync_comparisons!(user, comparisons_ids)

      expect(processor).to have_received(:call).with(user, comparison_1, job_1)
      expect(processor).to have_received(:call).with(user, comparison_2, job_2)
    end
  end
end
