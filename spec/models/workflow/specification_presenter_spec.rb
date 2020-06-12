require "rails_helper"

RSpec.describe Workflow::SpecificationPresenter, type: :model do
  include Imports::WorkflowHelper
  include Imports::WorkflowSpecificationHelper

  subject(:presenter) do
    described_class.new(workflow_presenter.params, context, workflow_presenter.slot_objects)
  end

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:raw) { params }
  let(:subject_response) { presenter.build }
  let(:workflow_presenter) { Workflow::Presenter.new(raw, context) }
  let(:locale_scope) { "activemodel.errors.models.workflow/specification_presenter.attributes" }
  let(:dxid) { WorkflowSeries.construct_dxid(context.username, raw["workflow_name"]) }
  let(:workflow_series) { WorkflowSeries.find_by(dxid: dxid) }
  let(:existing_workflow_series) do
    create(:workflow_series, dxid: dxid, user_id: user.id,
           name: raw["workflow_name"], scope: "private",
           latest_revision_workflow: create(:workflow, revision: 1))
  end

  before do
    raw["slots"][..1].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first, user_id: user.id)
    end
  end

  describe "#build" do
    let(:result) do
      {
        name: raw["workflow_name"], title: raw["workflow_title"], user_id: user.id,
        spec: specification, readme: raw["readme"], revision: 1, scope: "private",
        workflow_series_id: workflow_series.id,
        project: user.private_files_project
      }
    end

    it "returns workflow json" do
      expect(subject_response).to eq(result)
    end

    context "when a workflow is new" do
      it "creates workflow_series" do
        expect { subject_response }.to change(WorkflowSeries, :count).by(1)
      end
    end

    context "when a workflow is not new" do
      before do
        raw["is_new"] = false
        existing_workflow_series
        result[:revision] = result[:revision] + 1
      end

      it "creates workflow_series" do
        expect { subject_response }.not_to change(WorkflowSeries, :count)
      end

      it "increases revision by 1" do
        expect(subject_response).to eq(result)
      end
    end
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when name has invalid format" do
    before do
      raw["workflow_name"] = ""
      presenter.valid?
    end

    it "add errors for name attribute" do
      expect(presenter.errors[:name]).to include(I18n.t("name.format", scope: locale_scope))
    end
  end

  context "when title has invalid format" do
    before do
      raw["workflow_title"] = ""
      presenter.valid?
    end

    it "add errors for title attribute" do
      expect(presenter.errors[:title]).
        to include(I18n.t("title.non_empty_string", scope: locale_scope))
    end
  end

  context "when is_new attribute has invalid value" do
    before do
      raw["is_new"] = ""
      presenter.valid?
    end

    it "add errors for is_new attribute" do
      expect(presenter.errors[:is_new]).to include(I18n.t("is_new.inclusion", scope: locale_scope))
    end
  end

  context "when workflow is new and workflow_series already exists" do
    before do
      existing_workflow_series
      presenter.valid?
    end

    it "add errors for workflow_series" do
      options = { scope: locale_scope, name: raw["workflow_name"] }
      expect(presenter.errors[:workflow_series]).
        to include(I18n.t("workflow_series.unique", **options))
    end
  end

  context "when workflow is not new and workflow_series doesn't exist" do
    before do
      raw["is_new"] = false
      presenter.valid?
    end

    it "add errors for workflow_series" do
      options = { scope: locale_scope, name: raw["workflow_name"] }
      expect(presenter.errors[:workflow_series]).
        to include(I18n.t("workflow_series.blank", **options))
    end
  end
end
