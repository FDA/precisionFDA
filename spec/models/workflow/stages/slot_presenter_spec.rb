require "rails_helper"

RSpec.describe Workflow::Stages::SlotPresenter, type: :model do
  include Imports::WorkflowHelper
  include Imports::StagesHelper

  subject { presenter }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:slots) { params["slots"] }
  let(:slot) { slots.second }
  let(:slot_number) { 1 }
  let(:app_dxid) { params["slots"].second["uid"].split("-1").first }
  let(:stages_presenter) { Workflow::StagesPresenter.new(slots, context) }
  let(:presenter) { described_class.new(slot, slot_number, stages_presenter) }
  let(:inputs_scope) { "activemodel.errors.models.workflow/stages/input_presenter.attributes" }
  let(:locale_scope) { "activemodel.errors.models.workflow/stages/slot_presenter.attributes" }
  let(:locale_options) { { scope: locale_scope, name: presenter.name } }
  let(:subject_response) { presenter.build }

  before do
    create(:app, dxid: app_dxid, user_id: user.id)
  end

  describe ".build" do
    it "returns slot json" do
      expect(subject_response).to eq(presenter_result.second)
    end
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when the slot's inputs are invalid" do
    let(:input) { slot["inputs"].first }

    before do
      slot["inputs"].first["name"] = "007Input"
      slot["inputs"].second["name"] = "008Input"
      presenter.valid?
    end

    it "add errors to the attribute" do
      first_options = {
        scope: inputs_scope, slot_name: presenter.name,
        input_name: slot["inputs"].first["name"]
      }
      second_options = {
        scope: inputs_scope,
        slot_name: presenter.name,
        input_name: slot["inputs"].second["name"],
      }
      expect(presenter.errors[:inputs]).
        to include(I18n.t("name.format", **first_options),
                   I18n.t("name.format", **second_options))
    end
  end

  context "when the slot's slot_id isn't unique" do
    before do
      slots.first["slotId"] = slot["slotId"]
      presenter.valid?
    end

    it "add errors to the attribute" do
      expect(presenter.errors[:slot_id]).to include(I18n.t("slot_id.unique", **locale_options))
    end
  end

  context "when slot's name is empty" do
    before do
      slot["name"] = ""
      presenter.valid?
    end

    it "add errors to the attribute" do
      options = { scope: locale_scope, number: (presenter.slot_number + 1).ordinalize }
      expect(presenter.errors[:name]).to include(I18n.t("name.non_empty_string", **options))
    end
  end

  context "when slot's uid is empty" do
    before do
      slot["uid"] = ""
      presenter.valid?
    end

    it "add errors to the attribute" do
      options = { name: presenter.name, attribute: "uid" }
      expect(presenter.errors[:uid]).
        to include(I18n.t("errors.messages.non_empty_string", **options))
    end
  end

  context "when slot's slot_id is empty" do
    before do
      slot["slotId"] = ""
      presenter.valid?
    end

    it "add errors to the attribute" do
      options = { name: presenter.name, attribute: "slot_id" }
      expect(presenter.errors[:slot_id]).
        to include(I18n.t("errors.messages.non_empty_string", **options))
    end
  end

  context "when slot's app is empty" do
    before do
      slot["uid"] = ""
      presenter.valid?
    end

    it "add errors to the attribute" do
      expect(presenter.errors[:app]).to include(I18n.t("app.blank", **locale_options))
    end
  end

  context "when slot's instance_type is empty" do
    before do
      slot["instanceType"] = ""
      presenter.valid?
    end

    it "add errors to the attribute" do
      options = { name: presenter.name, attribute: "instance_type" }
      expect(presenter.errors[:instance_type]).
        to include(I18n.t("errors.messages.non_empty_string", **options))
    end
  end

  context "when slot's instance_type is wrong" do
    before do
      slot["instanceType"] = "wrong_type"
      presenter.valid?
    end

    it "add errors to the attribute" do
      expect(presenter.errors[:instance_type]).
        to include(I18n.t("instance_type.inclusion", **locale_options))
    end
  end

  context "when slot's prevSlot is empty" do
    before do
      slot["prevSlot"] = ""
      presenter.valid?
    end

    context "when it's expected" do
      it "add errors to the attribute" do
        options = { name: presenter.name, attribute: "prev_slot" }
        expect(presenter.errors[:prev_slot]).
          to include(I18n.t("errors.messages.non_empty_string", **options))
      end
    end

    context "when it isn't expected" do
      let(:slot) { slots.first }
      let(:slot_number) { 0 }

      it "doesn't add errors to the attribute" do
        expect(presenter.errors[:prev_slot]).to be_empty
      end
    end
  end

  context "when slot's nextSlot is empty" do
    before do
      slot["nextSlot"] = ""
      presenter.valid?
    end

    context "when it's expected" do
      let(:slot) { slots.first }
      let(:slot_number) { 0 }

      it "add errors to the attribute" do
        expect(presenter.errors[:next_slot]).
          to include(I18n.t("next_slot.non_empty_string", **locale_options))
      end
    end

    context "when it isn't expected" do
      it "doesn't add errors to the attribute" do
        expect(presenter.errors[:next_slot]).to be_empty
      end
    end
  end
end
