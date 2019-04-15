require "rails_helper"
include Imports::WorkflowHelper
include Imports::AppSpecHelper

RSpec.describe Workflow::Cwl::SlotPresenter, type: :model do
  subject { presenter }
  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:workflow_cwl) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:steps_json) { YAML.load(workflow_cwl)["steps"] }
  let(:presenter) { Workflow::Cwl::StagesPresenter.new(steps_json, context) }
  let(:second_slot) { presenter.slot_objects["app-776-second-step-1"] }
  let(:first_slot) { presenter.slot_objects["app-776-first-step-1"] }
  let(:subject_response) { presenter.build }

  before do
    allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
    params["slots"].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first, user_id: user.id, spec: app_spec)
    end
    allow(first_slot).to receive(:slot_id).and_return(params["slots"].first["slotId"])
    allow(second_slot).to receive(:slot_id).and_return(params["slots"].second["slotId"])
  end

  describe ".build" do
    it "returns slot json" do
      expect(subject_response).to eq(params["slots"])
    end
  end
end
