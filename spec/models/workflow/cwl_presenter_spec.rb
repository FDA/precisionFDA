require "rails_helper"
include Imports::WorkflowHelper
include Imports::StagesHelper
include Imports::AppSpecHelper

RSpec.describe Workflow::CwlPresenter, type: :model do
  context "when input data is cwl file" do
    let(:raw) do
      { file: IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
    end
    let(:stages) { presenter.send(:cwl_stages_object) }
    let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
    let!(:first_app) do
      create(:app, dxid: params["slots"].first["uid"].split("-1").first,
             user_id: user.id, spec: app_spec, title: params["slots"].first["name"])
    end
    let!(:second_app) do
      create(:app, dxid: params["slots"].second["uid"].split("-1").first,
             user_id: user.id, spec: app_spec, title: params["slots"].second["name"])
    end

    before do
      allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
      allow(stages.slot_objects["app-776-first-step-1"]).to receive(:slot_id)
        .and_return(params["slots"].first["slotId"])
      allow(stages.slot_objects["app-776-second-step-1"]).to receive(:slot_id)
        .and_return(params["slots"].second["slotId"])
    end

    it_behaves_like "workflow_presenter"
  end
end
