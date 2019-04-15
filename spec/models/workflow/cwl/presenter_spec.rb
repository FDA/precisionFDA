require "rails_helper"
include Imports::WorkflowHelper
include Imports::AppSpecHelper

RSpec.describe Workflow::Cwl::Presenter, type: :model do
  subject { presenter }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:workflow_cwl) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:presenter) { described_class.new(workflow_cwl, context) }
  let(:stages) { presenter.send(:stages_object) }
  let(:subject_response) { presenter.build }

  before do
    allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
    params["slots"].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first, user_id: user.id, spec: app_spec)
    end
    allow(stages.slot_objects["app-776-first-step-1"]).to receive(:slot_id)
      .and_return(params["slots"].first["slotId"])
    allow(stages.slot_objects["app-776-second-step-1"]).to receive(:slot_id)
      .and_return(params["slots"].second["slotId"])
  end

  describe ".build" do
    it "returns workflow json" do
      expect(subject_response).to eq(params)
    end
  end
end
