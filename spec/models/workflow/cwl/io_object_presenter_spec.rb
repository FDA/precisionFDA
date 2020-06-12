require "rails_helper"

RSpec.describe Workflow::Cwl::IOObjectPresenter, type: :model do
  include Imports::WorkflowHelper
  include Imports::AppSpecHelper

  subject { presenter }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:workflow_cwl) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:steps_json) { YAML.safe_load(workflow_cwl)["steps"] }
  let(:step_json) { steps_json.slice("app-776-second-step-1") }
  let(:stages_presenter) { Workflow::Cwl::StagesPresenter.new(steps_json, context) }
  let(:first_slot) { stages_presenter.slot_objects["app-776-first-step-1"] }
  let(:second_slot) do
    Workflow::Cwl::SlotPresenter.new(
      step_json.keys.first, step_json.values.first,
      1, stages_presenter
    )
  end
  let(:presenter) do
    described_class.new(app_spec["input_spec"].first, second_slot, step_json.values.first["in"])
  end
  let(:subject_response) { presenter.build }

  before do
    params["slots"].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first, user_id: user.id, spec: app_spec)
    end
    stages_presenter.slot_objects["app-776-second-step-1"] = second_slot
    allow(first_slot).to receive(:slot_id).and_return(params["slots"].first["slotId"])
    allow(second_slot).to receive(:slot_id).and_return(params["slots"].second["slotId"])
  end

  describe ".build" do
    it "returns slot json" do
      expect(subject_response.stringify_keys).to eq(params["slots"].second["inputs"].first)
    end
  end
end
