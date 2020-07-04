require "rails_helper"

RSpec.describe Workflow::StagesPresenter, type: :model do
  include Imports::WorkflowHelper
  include Imports::StagesHelper

  subject(:presenter) { described_class.new(raw, context) }

  let(:user) { create(:user) }
  let(:context) { Context.new(user.id, user.dxuser, SecureRandom.uuid, 1.day.from_now, user.org) }
  let(:raw) { params["slots"] }
  let(:subject_response) { presenter.build }

  before do
    raw[..1].each do |slot|
      create(:app, dxid: slot["uid"].split("-1").first, user_id: user.id)
    end
  end

  describe "#build" do
    it "returns stages json" do
      expect(subject_response).to eq(presenter_result)
    end
  end

  describe "#max_stage_index" do
    it "returns max stage index" do
      expect(presenter.max_stage_index).to eq(1)
    end
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end
end
