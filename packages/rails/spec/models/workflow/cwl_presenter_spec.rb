require "rails_helper"

RSpec.describe Workflow::CwlPresenter, type: :model do
  include Imports::WorkflowHelper
  include Imports::StagesHelper
  include Imports::AppSpecHelper

  context "when input data is cwl file" do
    let(:raw) do
      { file: File.read("spec/support/files/workflow_import/workflow.cwl") }
    end
    let(:stages) { presenter.send(:cwl_stages_object) }
    let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }

    before do
      params["slots"][..1].each do |slot|
        create(:app, dxid: slot["uid"].split("-1").first,
               user_id: user.id, spec: app_spec, title: slot["name"])
      end

      allow(stages.slot_objects["app-776-first-step-1"]).to receive(:slot_id).
        and_return(params["slots"].first["slotId"])
      allow(stages.slot_objects["app-776-second-step-1"]).to receive(:slot_id).
        and_return(params["slots"].second["slotId"])
    end

    it_behaves_like "workflow_presenter"
  end
end
