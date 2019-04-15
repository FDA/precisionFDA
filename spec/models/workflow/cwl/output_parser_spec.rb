require "rails_helper"
include Imports::WorkflowHelper
include Imports::AppSpecHelper

RSpec.describe Workflow::Cwl::OutputParser, type: :model do
  subject { parser }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, nil, nil) }
  let(:raw) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:cwl_parser){ Workflow::Cwl::Parser.new(raw, context) }
  let(:step_parser) { cwl_parser.steps_objects.first }
  let(:parser) { step_parser.output_objects.second }
  let(:locale_scope) { "activemodel.errors.models.workflow/cwl/output_parser.attributes" }
  let!(:first_app) do
    create(:app, dxid: params["slots"].first["uid"].split("-1").first, user_id: user.id, spec: app_spec)
  end

  let(:locale_options) do
    { scope: locale_scope, step_name: step_parser.name }
  end

  before do
    allow_any_instance_of(Context).to receive(:logged_in?).and_return(true)
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when name is invalid" do
    let(:parser) { step_parser.output_objects.third }

    before do
      step_parser.step_json["out"] << "wrong_name"
      parser.valid?
    end
    it "has appropriate cwl error" do
      outputs = first_app.spec["output_spec"].map { |output| output["name"] }
      options = locale_options.merge(app_name: first_app.title, outputs: outputs.join(', '))
      expect(parser.errors[:name]).to include(I18n.t("name.inclusion", options))
    end
  end
end
