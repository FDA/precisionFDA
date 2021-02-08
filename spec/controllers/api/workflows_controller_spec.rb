require "rails_helper"

RSpec.describe Api::WorkflowsController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }
  let(:admin) { create(:user, :admin) }
  let(:user_workflow) { create(:workflow, user: user) }
  let(:admin_workflow) { create(:workflow, user: admin) }

  describe "POST copy" do
    let(:space) { create(:space, :review, :active, host_lead_id: user.id) }
    let(:workflows) { create_list(:workflow, 2, user: user) }
    let(:copy_service) { instance_double(CopyService, copy: []) }

    before do
      authenticate!(user)

      allow(CopyService).to receive(:new).and_return(copy_service)
    end

    it "copies workflows" do
      post :copy, params: { item_ids: workflows.map(&:id), scope: space.scope }, format: :json

      expect(response).to be_successful

      workflows.each do |wf|
        expect(copy_service).to have_received(:copy).with(wf, space.scope).exactly(1).times
      end
    end
  end

  describe "PUT un_feature" do
    context "when user is authenticated" do
      let(:workflow_series) { create(:workflow_series, user: admin, featured: true) }
      let(:workflow) do
        create(:workflow, user: admin, workflow_series: workflow_series,
               scope: Scopes::SCOPE_PUBLIC, featured: true)
      end

      before do
        authenticate!(admin)
      end

      it "un-feature workflows" do
        put :invert_feature, params: { item_ids: workflow.uid }, format: :json

        expect(response).to be_successful
        expect { workflow.reload }.to change(workflow, :featured).from(true).to(false)
        expect { workflow_series.reload }.to change(workflow_series, :featured).from(true).to(false)
      end
    end

    context "when user is not authenticated" do
      it "feature workflows" do
        put :invert_feature, params: { item_ids: user_workflow.uid }

        expect(response).to be_unauthorized
      end
    end
  end

  describe "POST delete" do
    context "when user is authenticated" do
      let(:workflow_series) { create(:workflow_series, user: user) }
      let(:workflow) { create(:workflow, user: user, workflow_series: workflow_series) }

      before do
        authenticate!(user)
      end

      it "soft-delete workflows" do
        post :soft_delete, params: { item_ids: workflow.uid }, format: :json

        expect(response).to be_successful
        expect { workflow.reload }.to change(workflow, :deleted).from(false).to(true)
        expect { workflow_series.reload }.to change(workflow_series, :deleted).from(false).to(true)
      end
    end

    context "when user is not authenticated" do
      it "soft-delete workflows" do
        put :soft_delete, params: { item_ids: user_workflow.uid }

        expect(response).to be_unauthorized
      end
    end
  end

  describe "GET #show" do
    context "when user is authenticated" do
      let(:workflow_spec) do
        JSON.parse(File.read(Rails.root.join("spec/fixtures/workflow_spec_fixture.json")))
      end

      let(:workflow) { create(:workflow, user_id: admin.id, spec: workflow_spec) }

      before do
        authenticate!(admin)
      end

      it "renders workflows" do
        get :show, params: { id: workflow.uid }

        payload = JSON.parse(response.body).with_indifferent_access
        aggregate_failures do
          expect(response).to be_successful
          expect(payload["workflow"]).to match(
            a_hash_including("workflow_series_id" => workflow.id),
          )
        end
      end
    end

    context "when user is not authenticated" do
      it "is unauthenticated" do
        get :show, params: { id: admin_workflow.uid }

        expect(response).to be_unauthorized
      end
    end
  end
end
