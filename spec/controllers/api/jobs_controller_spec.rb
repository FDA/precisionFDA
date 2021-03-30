require "rails_helper"

RSpec.describe Api::JobsController, type: :controller do
  let(:host_lead) { create(:user, dxuser: "host_lead") }
  let(:guest_lead) { create(:user, dxuser: "guest_lead") }
  let(:foreign_user) { create(:user, dxuser: "foreign_user") }
  let(:space) do
    create(:space, :review, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
  end
  let(:workflow) { create(:workflow, user_id: host_lead.id) }
  let(:analysis) { create(:analysis, user_id: host_lead.id, workflow_id: workflow.id) }
  let(:analysis2) { create(:analysis, user_id: host_lead.id, workflow_id: workflow.id) }
  let(:analysis3) { create(:analysis, user_id: guest_lead.id, workflow_id: workflow.id) }
  let(:app) { create(:app_with_series, title: "app_title") }
  let(:jobs_size) { response_body[:jobs].size }
  let(:job_wf_id) { response_body[:jobs][0] }
  let(:jobs_jobs) { response_body[:jobs][0][:jobs][0] }

  describe "GET workflows" do
    context "when user is authenticated" do
      context "when jobs" do
        before do
          authenticate!(host_lead)
          create(
            :job,
            user_id: host_lead.id,
            scope: space.uid,
            app_id: app.id,
            analysis_id: analysis2.id,
          )
        end

        it "returns analyses" do
          get :workflow, params: { id: workflow }

          aggregate_failures do
            expect(response).to be_successful
            expect(response_body.size).to eq(2)
            expect(jobs_size).to eq 1
          end
        end
      end
    end
  end

  describe "GET spaces" do
    context "when logged in" do
      before do
        authenticate!(host_lead)
        create(:space_membership, :lead, user_id: host_lead.id)
      end

      context "when jobs" do
        context "when context is accessible" do
          before do
            create(
              :job,
              user_id: host_lead.id,
              scope: space.uid,
              app_id: app.id,
              analysis_id: analysis2.id,
            )
            create(
              :job,
              user_id: host_lead.id,
              scope: space.uid,
              app_id: app.id,
              analysis_id: analysis.id,
            )
            create(
              :job,
              user_id: guest_lead.id,
              scope: space.uid,
              app_id: app.id,
              analysis_id: analysis3.id,
            )
          end

          it "renders context accessible jobs" do
            get :spaces

            aggregate_failures do
              expect(response).to be_successful
              expect(jobs_size).to eq(3)
              expect(job_wf_id).to match(a_hash_including("id" => workflow.id))
              expect(jobs_jobs).to match(a_hash_including("app_title" => app.title))
              expect(jobs_jobs).to match(a_hash_including("workflow_uid" => workflow.uid))
            end
          end
        end
      end

      context "when job is not found" do
        before do
          authenticate!(host_lead)
        end

        it "returns an empty array" do
          get :spaces

          expect(response_body["jobs"]).to eq([])
        end
      end
    end

    context "when logged out" do
      it "returns unauthenticated" do
        get :spaces

        expect(response).to be_unauthorized
      end
    end

    context "when space is not accessible by a context" do
      before do
        authenticate!(foreign_user)
        create(
          :job,
          user_id: host_lead.id,
          scope: space.uid,
          app_id: app.id,
          analysis_id: analysis.id,
        )
        create(:space_membership, :lead, user_id: host_lead.id)
      end

      it "returns noting" do
        get :spaces

        aggregate_failures do
          expect(response).to be_successful
          expect(jobs_size).to be_zero
        end
      end
    end
  end
end
