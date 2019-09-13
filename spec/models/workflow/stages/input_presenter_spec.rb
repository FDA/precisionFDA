require "rails_helper"
include Imports::WorkflowHelper

RSpec.describe Workflow::Stages::InputPresenter, type: :model do
  subject { presenter }

  let(:slot) { params["slots"].first }
  let(:slot_number) { 0 }
  let(:slot_presenter) { Workflow::Stages::SlotPresenter.new(slot, slot_number, stages_presenter) }
  let(:stages_presenter) { Workflow::StagesPresenter.new(params["slots"], nil) }
  let(:input) { slot["inputs"].first }
  let(:presenter) { described_class.new(input, 0, slot_presenter) }
  let(:subject_response) { presenter.build }
  let(:locale_scope) { "activemodel.errors.models.workflow/stages/input_presenter.attributes" }
  let(:locale_options) do
    { scope: locale_scope, slot_name: presenter.slot.name, input_name: presenter.name }
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when the input name is blank" do
    before do
      input["name"] = ""
      presenter.valid?
    end
    it "add errors to the attribute" do
      options = { scope: locale_scope, slot_name: presenter.slot.name,
                  input_number: (presenter.input_number + 1).ordinalize }
      expect(presenter.errors[:name]).to include(I18n.t("name.non_empty_string", options))
    end
  end

  context "when the input name has invalid format" do
    before do
      input["name"] = "007Input"
      presenter.valid?
    end
    it "add errors to the attribute" do
      expect(presenter.errors[:name]).to include(I18n.t("name.format", locale_options))
    end
  end

  context "when the input name not uniq" do
    before do
      slot["inputs"].second["name"] = slot["inputs"].first["name"]
      presenter.valid?
    end
    it "add errors to the attribute" do
      expect(presenter.errors[:name]).to include(I18n.t("name.unique", locale_options))
    end
  end

  context "when the input class is blank" do
    before do
      input["class"] = ""
      presenter.valid?
    end
    it "add errors to the attribute" do
      expect(presenter.errors[:input_class])
        .to include(I18n.t("input_class.non_empty_string", locale_options))
    end
  end

  context "when the input class type is incorrect" do
    before do
      input["class"] = "object"
      presenter.valid?
    end
    it "add errors to the attribute" do
      options = locale_options.merge(types: App::VALID_IO_CLASSES.join(", "))
      expect(presenter.errors[:input_class])
        .to include(I18n.t("input_class.inclusion", options))
    end
  end

  context "when the input optional is not boolean" do
    before do
      input["optional"] = "string"
      presenter.valid?
    end
    it "add errors to the attribute" do
      expect(presenter.errors[:optional])
        .to include(I18n.t("optional.inclusion", locale_options))
    end
  end

  context "when the input label is incorrect" do
    before do
      input["label"] = nil
      presenter.valid?
    end
    it "add errors to the attribute" do
      expect(presenter.errors[:label])
        .to include(I18n.t("label.non_empty_string", locale_options))
    end
  end

  context "when the input required_run_input is not boolean" do
    before do
      input["requiredRunInput"] = "string"
      presenter.valid?
    end
    it "add errors to the attribute" do
      expect(presenter.errors[:required_run_input])
        .to include(I18n.t("required_run_input.inclusion", locale_options))
    end
  end

  context "when the input parent slot doesn't match slot id" do
    before do
      input["parent_slot"] = "wrong_id"
      presenter.valid?
    end
    it "add errors to the attribute" do
      options = locale_options.merge(parent_slot: presenter.parent_slot, slot_id: slot["slotId"])
      expect(presenter.errors[:parent_slot]).to include(I18n.t("parent_slot.match", options))
    end
  end

  context "when the input stage name doesn't match slot name" do
    before do
      input["stageName"] = "wrong_stage_name"
      presenter.valid?
    end
    it "add errors to the attribute" do
      options = locale_options.merge(stage_name: slot["slotId"], expected_name: slot["name"])
      expect(presenter.errors[:stage_name]).to include(I18n.t("stage_name.match", options))
    end
  end

  context "when the input values have incorrect format" do
    before do
      input["values"] = {}
      presenter.valid?
    end
    it "add errors to the attribute" do
      expect(presenter.errors[:values]).to include(I18n.t("values.format", locale_options))
    end
  end
end
