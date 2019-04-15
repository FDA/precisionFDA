require "rails_helper"
include Imports::WorkflowHelper
include Imports::AppSpecHelper

RSpec.describe Workflow::Cwl::StepParser, type: :model do
  subject { parser }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:raw) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:cwl_parser){ Workflow::Cwl::Parser.new(raw, context) }
  let(:parser) { cwl_parser.steps_objects.first }
  let(:locale_scope) { "activemodel.errors.models.workflow/cwl/step_parser.attributes" }
  let!(:app) do
    create(:app, dxid: params["slots"].first["uid"].split("-1").first,
           user_id: user.id, spec: app_spec, title: params["slots"].first["name"])
  end
  let(:locale_options) do
    { scope: locale_scope, name: parser.name }
  end

  before do
    allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when app is not found" do
    before do
      app.destroy
      parser.valid?
    end
    it "has appropriate cwl error" do
      expect(parser.errors[:app]).to include(I18n.t("app.blank", locale_options))
    end
  end

  context "when run has invalid found" do
    before do
      parser.step_json["run"] = "#{parser}.wdl"
      parser.valid?
    end
    it "has appropriate cwl error" do
      expect(parser.errors[:run]).to include(I18n.t("run.format", locale_options))
    end
  end

  context "when name is invalid" do
    before do
      cwl_parser.cwl_data["steps"]["wrong_name"] = cwl_parser.cwl_data["steps"].delete(app.title)
      parser.valid?
    end
    it "has appropriate cwl error" do
      options = locale_options.merge(step_number: parser.step_number)
      expect(parser.errors[:name]).to include(I18n.t("name.format", options))
    end
  end

  context "when cwl raw has invalid outs" do
    let(:raw) { IO.read(Rails.root.join("spec/support/files/workflow_import/invalid_workflow.cwl")) }
    before do
      parser.valid?
    end
    it "has appropriate cwl error" do
      expect(parser.errors[:outputs]).to include(I18n.t("outputs.format", locale_options))
    end
  end
end
