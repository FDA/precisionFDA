require "rails_helper"

RSpec.describe Workflow::Cwl::Parser, type: :model do
  include Imports::WorkflowHelper
  include Imports::AppSpecHelper

  subject { parser }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:raw) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:parser) { described_class.new(raw, context) }
  let(:locale_scope) { "activemodel.errors.models.workflow/cwl/parser.attributes" }
  let(:locale_options) { { scope: locale_scope } }

  before do
    params["slots"][..1].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first,
             user_id: user.id, spec: app_spec, title: slot["name"])
    end
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
      expect(parser.errors[:base]).to include(
        "Step #{step.name}: #{I18n.t('id.blank', **locale_options)}",
        "Step #{step.name}: #{I18n.t('app.blank', **locale_options)}",
      )
    end
  end

  context "when the steps have wrong format" do
    before do
      parser.cwl_data["steps"]["third_step"] = "wrong_step"
      parser.valid?
    end

    it "has appropriate cwl error" do
      expect(parser.errors[:steps]).to include(I18n.t("steps.format", **locale_options))
    end
  end

  context "when the cwl has wrong class" do
    before do
      parser.cwl_data["class"] = "wrong_class"
      parser.valid?
    end

    it "has appropriate cwl error" do
      expect(parser.errors[:cwl_class]).to include(I18n.t("cwl_class.format", **locale_options))
    end
  end
end
