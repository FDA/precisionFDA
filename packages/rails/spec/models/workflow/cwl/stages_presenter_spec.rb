require "rails_helper"

RSpec.describe Workflow::Cwl::StagesPresenter, type: :model do
  include Imports::WorkflowHelper
  include Imports::AppSpecHelper

  subject(:presenter) { described_class.new(steps_json, context) }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:workflow_cwl) { File.read("spec/support/files/workflow_import/workflow.cwl") }
  let(:steps_json) { YAML.safe_load(workflow_cwl)["steps"] }
  let(:second_slot) { presenter.slot_objects["app-776-second-step-1"] }
  let(:first_slot) { presenter.slot_objects["app-776-first-step-1"] }
  let(:subject_response) { presenter.build }

  before do
    params["slots"].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first, user_id: user.id, spec: app_spec)
    end

    allow(first_slot).to receive(:slot_id).and_return(params["slots"].first["slotId"])
    allow(second_slot).to receive(:slot_id).and_return(params["slots"].second["slotId"])
  end

  describe "#build" do
    it "returns slot json" do
      expect(subject_response).to eq(params["slots"])
    end
  end

  describe "#max_stage_index" do
    it "returns max stage index" do
      expect(presenter.max_stage_index).to eq(1)
    end
  end
end
