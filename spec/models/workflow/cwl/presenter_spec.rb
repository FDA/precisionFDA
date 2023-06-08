require "rails_helper"

RSpec.describe Workflow::Cwl::Presenter, type: :model do
  include Imports::WorkflowHelper
  include Imports::AppSpecHelper

  subject(:presenter) { described_class.new(workflow_cwl, context) }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:workflow_cwl) { File.read("spec/support/files/workflow_import/workflow.cwl") }
  let(:stages) { presenter.send(:stages_object) }
  let(:subject_response) { presenter.build }

  before do
    params["slots"].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first, user_id: user.id, spec: app_spec)
    end

    allow(stages.slot_objects["app-776-first-step-1"]).to receive(:slot_id).
      and_return(params["slots"].first["slotId"])
    allow(stages.slot_objects["app-776-second-step-1"]).to receive(:slot_id).
      and_return(params["slots"].second["slotId"])
  end

  describe "#build" do
    it "returns workflow json" do
      expect(subject_response).to eq(params)
    end
  end
end
