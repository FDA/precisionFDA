require "rails_helper"

RSpec.describe Workflow::Cwl::InputParser, type: :model do
  include Imports::WorkflowHelper
  include Imports::AppSpecHelper

  subject { parser }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:raw) { IO.read(Rails.root.join("spec/support/files/workflow_import/workflow.cwl")) }
  let(:cwl_parser) { Workflow::Cwl::Parser.new(raw, context) }
  let(:step_parser) { cwl_parser.steps_objects.first }
  let(:parser) { step_parser.input_objects.second }
  let(:locale_scope) { "activemodel.errors.models.workflow/cwl/input_parser.attributes" }
  let!(:first_app) do
    create(:app, dxid: params["slots"].first["uid"].split("-1").first,
            user_id: user.id, spec: app_spec)
  end
  let!(:second_app) do
    create(:app, dxid: params["slots"].second["uid"].split("-1").first,
            user_id: user.id, spec: app_spec)
  end
  let(:locale_options) do
    { scope: locale_scope, step_name: step_parser.name }
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when name is invalid" do
    before do
      input_name = step_parser.step_json["in"].keys.first
      step_parser.step_json["in"]["wrong_name"] = step_parser.step_json["in"].delete(input_name)
      parser.valid?
    end

    it "has appropriate cwl error" do
      inputs = first_app.spec["input_spec"].map { |input| input["name"] }
      options = locale_options.merge(app_name: first_app.title, inputs: inputs.join(", "))
      expect(parser.errors[:name]).to include(I18n.t("name.inclusion", **options))
    end
  end

  context "when step is first and link wrong" do
    before do
      input_name = step_parser.step_json["in"].keys.second
      step_parser.step_json["in"][input_name] = "wrong_link"
      parser.valid?
    end

    it "has appropriate cwl error" do
      inputs = cwl_parser.inputs.keys.join(", ")
      options = locale_options.merge(input_name: parser.name, link: "wrong_link", inputs: inputs)
      expect(parser.errors[:link]).to include(I18n.t("link.first_step_inclusion", **options))
    end
  end

  context "when step is first" do
    context "with a wrong link name" do
      before do
        input_name = step_parser.step_json["in"].keys.second
        step_parser.step_json["in"][input_name] = "wrong_link"
        parser.valid?
      end

      it "has appropriate cwl error" do
        inputs = cwl_parser.inputs.keys.join(", ")
        options = locale_options.merge(input_name: parser.name, link: "wrong_link", inputs: inputs)
        expect(parser.errors[:link]).to include(I18n.t("link.first_step_inclusion", **options))
      end
    end

    context "with a wrong link type" do
      before do
        first_app.spec["input_spec"].second["class"] = "wrong_class"
        first_app.save
        parser.valid?
      end

      it "has appropriate cwl error" do
        input_name = step_parser.step_json["in"].keys.second
        options = locale_options.merge(input_name: parser.name,
                                       input_class: parser.appropriate_app_input["class"],
                                       parameter_class: cwl_parser.inputs[input_name])
        expect(parser.errors[:link]).to include(I18n.t("link.wrong_type", **options))
      end
    end
  end

  context "when step is not_first" do
    let(:step_parser) { cwl_parser.steps_objects.second }

    context "with link that is output of previous step" do
      it { is_expected.to be_valid }
    end

    context "with a wrong link name" do
      before do
        input_name = step_parser.step_json["in"].keys.second
        step_parser.step_json["in"][input_name] = "wrong_link"
        parser.valid?
      end

      it "has appropriate cwl error" do
        inputs = (step_parser.allowable_link_outputs + cwl_parser.inputs.keys).join(", ")
        options = locale_options.merge(input_name: parser.name,
                                       link: "wrong_link",
                                       inputs: inputs)
        expect(parser.errors[:link]).to include(I18n.t("link.inclusion", **options))
      end
    end

    context "with a wrong link type" do
      before do
        second_app.spec["input_spec"].second["class"] = "wrong_class"
        second_app.save
        parser.valid?
      end

      it "has appropriate cwl error" do
        options = locale_options.merge(input_name: parser.name,
                                       input_class: parser.appropriate_app_input["class"],
                                       parameter_class: parser.link_type)
        expect(parser.errors[:link]).to include(I18n.t("link.wrong_type", **options))
      end
    end
  end
end
