require "rails_helper"

RSpec.describe Job, type: :model do
  let(:job) { create(:job) }

  let(:user) { create(:user, dxuser: "user") }
  let(:user_two) { create(:user, dxuser: "user_two") }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }

  describe "check whether job have unaccessible logs" do
    let(:job_log_unaccessible) { job.log_unaccessible?(context) }

    context "when job has a public scope" do
      before { job.update(scope: "public") }

      context "when user have launched a job" do
        before { job.update(user_id: context.user_id) }

        it "job log is accessible" do
          expect(job_log_unaccessible).to be_falsey
        end
      end

      context "when user did not launched a job" do
        it "job log is unaccessible" do
          expect(job_log_unaccessible).to be_truthy
        end
      end
    end

    context "when job has a private scope" do
      before { job.update(scope: "private") }

      context "when user have launched a job" do
        before { job.update(user_id: context.user_id) }

        it "job log is accessible" do
          expect(job_log_unaccessible).to be_falsey
        end
      end

      context "when user did not launched a job" do
        it "job log is accessible" do
          expect(job_log_unaccessible).to be_falsey
        end
      end
    end
  end
end
