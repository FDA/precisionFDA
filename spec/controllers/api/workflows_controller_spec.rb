require "rails_helper"

RSpec.describe Api::WorkflowsController, type: :controller do
  let(:user) { create(:user, dxuser: "user") }

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
end
