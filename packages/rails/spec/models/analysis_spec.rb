require "rails_helper"

RSpec.describe Analysis, type: :model do
  subject { analysis }

  let(:user) { create(:user, dxuser: "user") }
  let(:workflow) { create(:workflow) }
  let(:analysis) { create(:analysis) }
  let(:job) { create(:job) }
  let(:app_series) { create(:app_series) }

  let(:app) do
    create(
      :app,
      user_id: user.id,
      internet_access: false,
      instance_type: "baseline-8",
      packages: nil,
    )
  end

  describe "proper analysis created" do
    before do
      job.update(
        analysis_id: analysis.id,
        app_series_id: app_series.id,
        app_id: app.id,
        user_id: user.id,
      )
      app.update(app_series_id: app_series.id)
    end

    context "when job belongs to analysis" do
      it "analysis has one job" do
        expect(analysis.jobs.count).to eq 1
      end

      it "analysis belongs to job's user" do
        expect(analysis.jobs.first.user.id).to eq user.id
      end

      it "analysis job belongs to app" do
        expect(analysis.jobs.first.app_id).to eq app.id
      end

      it "analysis job belongs to user" do
        expect(analysis.jobs.first.user_id).to eq user.id
      end
    end

    context "when job is out of space" do
      let(:job_links) { subject.job_links(job) }

      it "returns a proper job_links object" do
        expect(job_links).to eq({
          app: "/apps/#{job.app.uid}",
          show: "/jobs/#{job.uid}",
          user: "/user/#{job.user.dxuser}",
        })
      end
    end
  end
end
