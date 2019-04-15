require "rails_helper"
include Imports::WorkflowHelper
include Imports::AppSpecHelper

RSpec.describe Workflow::Cwl::Parser, type: :model do
  subject { parser }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:raw) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:parser){ Workflow::Cwl::Parser.new(raw, context) }
  let(:locale_scope) { "activemodel.errors.models.workflow/cwl/parser.attributes" }
  let!(:first_app) do
    create(:app, dxid: params["slots"].first["uid"].split("-1").first,
           user_id: user.id, spec: app_spec, title: params["slots"].first["name"])
  end
  let!(:second_app) do
    create(:app, dxid: params["slots"].second["uid"].split("-1").first,
           user_id: user.id, spec: app_spec, title: params["slots"].second["name"])
  end
  let(:locale_options) do
    { scope: locale_scope }
  end

  before do
    allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when the step without id" do
    let(:locale_scope) { "activemodel.errors.models.workflow/cwl/step_parser.attributes" }
    let(:step) { parser.steps_objects.first }
    before do
      step.step_json["id"] = nil
      parser.valid?
    end
    it "has appropriate cwl error" do
      expect(parser.errors[:base]).to include("Step #{step.name}: #{I18n.t("id.blank", locale_options)}",
                                              "Step #{step.name}: #{I18n.t("app.blank", locale_options)}")
    end
  end

  context "when the steps have wrong format" do
    before do
      parser.cwl_data["steps"]["third_step"] = "wrong_step"
      parser.valid?
    end
    it "has appropriate cwl error" do
      expect(parser.errors[:steps]).to include(I18n.t("steps.format", locale_options))
    end
  end

  context "when the steps have wrong format" do
    before do
      parser.cwl_data["class"] = "wrong_class"
      parser.valid?
    end
    it "has appropriate cwl error" do
      expect(parser.errors[:cwl_class]).to include(I18n.t("cwl_class.format", locale_options))
    end
  end
end
