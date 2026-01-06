RSpec.describe Api::SpacesController, type: :controller do
  let(:admin) { create(:user, :admin) }
  let(:review_space_admin) { create(:user, :review_admin) }
  let(:host_lead) { create(:user, dxuser: "user_1") }
  let(:guest_lead) { create(:user, dxuser: "user_2") }
  let(:user) { create(:user, dxuser: "user_3") }
  let(:sponsor_lead) { create(:user, dxuser: "user_4") }
  let(:org) { create(:org, admin_id: guest_lead.id) }

  let(:space_params) do
    {
      name: "space_name",
      description: "space_description",
      host_lead_dxuser: host_lead.dxuser,
      guest_lead_dxuser: guest_lead.dxuser,
      space_type: "groups",
    }
  end

  let(:review_space_params) do
    {
      name: "space_name",
      description: "space_description",
      hostLeadDxuser: host_lead.dxuser,
      guestLeadDxuser: guest_lead.dxuser,
      spaceType: "review",
      sponsorLeadDxuser: sponsor_lead.dxuser,
    }
  end

  describe "POST add_data" do
    let(:space) { create(:space, :review, :active, host_lead_id: user.id) }
    let(:workflow_copy_service) { instance_double(CopyService::WorkflowCopier, copy: []) }
    let(:app_copy_service) { instance_double(CopyService::AppCopier, copy: []) }

    before do
      travel_to Time.current
      authenticate!(user)

      allow(CopyService::WorkflowCopier).to receive(:new).and_return(workflow_copy_service)
      allow(CopyService::AppCopier).to receive(:new).and_return(app_copy_service)
      allow(ActiveRecord::Base.connection).to receive(:commit_db_transaction)
      stub_request(:post, "https://localhost:3001/emails/typed")
      stub_request(:post, "https://localhost:3001/nodes/copy")
    end

    it "copies apps" do
      apps = create_list(:app, 2, user: user)

      post :add_data, params: { id: space.id, uids: apps.map(&:uid) }

      expect(response).to be_successful

      apps.each do |app|
        expect(app_copy_service).to have_received(:copy).with(app, space.scope, nil).exactly(1).times
      end
    end

    it "copies workflows" do
      workflows = create_list(:workflow, 2, user: user)

      post :add_data, params: { id: space.id, uids: workflows.map(&:uid) }

      expect(response).to be_successful

      workflows.each do |workflow|
        expect(workflow_copy_service).to have_received(:copy).with(workflow, space.scope, nil).exactly(1).times
      end
    end
  end

  describe "jobs" do
    let(:space) do
      create(:space, :group, :active, host_lead_id: host_lead.id, guest_lead_id: guest_lead.id)
    end

    let(:app) do
      create(
        :app,
        scope: space.uid,
        user_id: host_lead.id,
        input_spec: {},
        output_spec: {},
      )
    end
    let(:app_series) do
      create(
        :app_series,
        scope: space.uid,
        user_id: host_lead.id,
        latest_revision_app_id: app.id,
        latest_version_app_id: nil,
      )
    end
    let(:jobs_size) { 2 }

    before do
      authenticate!(host_lead)
      app.update(app_series_id: app_series.id)
      create_list(:job, jobs_size, scope: space.uid, app_id: app.id, user: host_lead)
    end

    it "renders jobs" do
      get :jobs, params: { id: space, app_id: app.id }

      expect(response).to be_successful
      expect(parsed_response["jobs"].size).to eq(jobs_size)
    end
  end
end
